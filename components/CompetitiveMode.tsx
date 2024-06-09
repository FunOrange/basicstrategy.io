'use client';
import Card from '@/components/Card';
import Countdown from '@/components/Countdown';
import { rules } from '@/constants/blackjack-rules';
import useGameAudio from '@/hooks/useGameAudio';
import {
  GameState,
  PlayerAction,
  type BlackjackJsBindings as Blackjack,
  type BlackjackState,
  HandValue,
  HandOutcome,
} from '@/types/blackjack-analyzer-rs';
import {
  dealerWillBeDealtBlackjack,
  handOutcomeToString,
  playerActionToString,
  playerWillBeDealtBlackjack,
} from '@/utils/blackjack-utils';
import { cn } from '@/utils/css';
import { sleep } from '@/utils/time';
import { Button, ButtonProps, Modal } from 'antd';
import { append, clamp } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import { isMatching, match } from 'ts-pattern';

const GAME_DURATION_SECONDS = 60;
const GAME_TICK_MS = 220;

interface Decision {
  dealerHand: HandValue;
  playerHand: HandValue;
  playerMove: PlayerAction;
  correctMove: PlayerAction;
}

export interface CompetitiveModeProps {
  Blackjack: Blackjack;
  back: () => void;
}
export function CompetitiveMode({ Blackjack, back }: CompetitiveModeProps) {
  const play = useGameAudio();
  const [game, setGame] = useState<BlackjackState>();
  const [allowedActions, setAllowedActions] = useState<PlayerAction[]>([]);

  // #region feedback: last decision
  const [lastDecision, setLastDecision] = useState<{ correct: boolean; correctMove: PlayerAction } | undefined>(
    undefined,
  );
  const [lastDecisionFeedbackVisisble, setLastDecisionFeedbackVisisble] = useState(false);
  useEffect(() => {
    setLastDecisionFeedbackVisisble(true);
    const timeout = setTimeout(() => {
      setLastDecisionFeedbackVisisble(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [lastDecision]);
  // #endregion feedback: last decision

  // #region feedback: round result
  const [lastGameOutcome, setLastGameOutcome] = useState<HandOutcome[] | undefined>(undefined);
  const [lastGameOutcomeVisible, setLastGameOutcomeVisible] = useState(false);
  useEffect(() => {
    setLastGameOutcomeVisible(true);
    const timeout = setTimeout(() => {
      setLastGameOutcomeVisible(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [lastGameOutcome]);
  // #endregion feedback: round result

  // #region score keeping
  const [startTimeMs, setStartTimeMs] = useState<number>(0);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const decisionsRef = useRef<Decision[]>([]);
  useEffect(() => {
    decisionsRef.current = decisions;
  }, [decisions]);
  const [gameOver, setGameOver] = useState(false);
  // #endregion score keeping

  const [highscoreBeatBy, setHighscoreBeatBy] = useState(0);

  useEffect(() => {
    const gameOverTimeout = init();
    return () => clearTimeout(gameOverTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = () => {
    setStartTimeMs(Date.now());
    setDecisions([]);
    setGameOver(false);
    const timeout = setTimeout(() => {
      const oldHighscore = Number(localStorage.getItem('highscore')) || 0;
      const { score } = calculateScore(decisionsRef.current);
      if (score > Number(oldHighscore)) {
        localStorage.setItem('highscore', String(score));
        setHighscoreBeatBy(score - Number(oldHighscore));
      } else {
        setHighscoreBeatBy(0);
      }
      setGameOver(true);
    }, GAME_DURATION_SECONDS * 1000);
    initRound();
    return timeout;
  };
  const initRound = () => {
    const bet = 1;
    let game = Blackjack.init_state(bet, rules);
    do {
      game = Blackjack.init_state(bet, rules);
    } while (playerWillBeDealtBlackjack(game) || dealerWillBeDealtBlackjack(game));

    runUntilPlayerTurn(game);
  };

  const handlePlayerAction = async (action: PlayerAction) => {
    if (action === PlayerAction.Hit) {
      play.dealCard();
    }
    const correctAction = Blackjack.get_optimal_move(game!);
    const actionIsCorrect = action === correctAction;
    if (actionIsCorrect) {
      play.correct();
    } else {
      play.incorrect();
    }
    setLastDecision({ correct: actionIsCorrect, correctMove: correctAction });
    setDecisions(
      append({
        dealerHand: Blackjack.get_dealer_hand_value(game!),
        playerHand: Blackjack.get_player_hand_value(game!),
        playerMove: action,
        correctMove: correctAction,
      }),
    );
    if (actionIsCorrect) {
      let _game = Blackjack.next_state(game!, action);
      runUntilPlayerTurn(_game);
    } else {
      initRound();
    }
  };

  const runUntilPlayerTurn = async (game: BlackjackState) => {
    setGame(game);
    while (![GameState.PlayerTurn, GameState.GameOver].includes(game.state)) {
      await sleep(GAME_TICK_MS);
      if (game.state === GameState.Dealing || game.state === GameState.DealerTurn) {
        play.dealCard();
      }
      game = Blackjack.next_state(game!);
      setGame(game);
    }
    if (game.state === GameState.PlayerTurn) {
      setAllowedActions(Blackjack.get_allowed_actions(game));
    } else if (game.state === GameState.GameOver) {
      setLastGameOutcome(Blackjack.get_game_outcome(game));
      initRound();
    }
  };

  if (game !== undefined) {
    return (
      <>
        <main className='flex flex-col items-center justify-between h-full max-h-[760px] py-20'>
          {/* top */}
          <div className='flex gap-2 min-h-[156px]'>
            {game.dealer_hand.map((card, i) => (
              <Card key={i} card={card} />
            ))}
          </div>

          {/* middle */}
          <div className='flex flex-col text-center min-w-48'>
            <div className='min-h-6' />
            <Countdown endTimeMs={startTimeMs + GAME_DURATION_SECONDS * 1000} className='text-gray-400' />
            {(() => {
              const dealerBust = lastGameOutcome?.some(isMatching({ kind: 'Won', reason: { kind: 'DealerBust' } }));
              return (
                <div className={cn('text-gray-400 transition-all min-h-6', !lastGameOutcomeVisible && 'opacity-0')}>
                  {dealerBust ? 'Dealer bust.' : lastGameOutcome?.map(handOutcomeToString).join(' ')}
                </div>
              );
            })()}
          </div>

          {/* bottom */}
          <div className='flex flex-col items-center gap-4'>
            <div className='flex min-h-[156px] gap-x-60'>
              {game.player_hands.map((hand, i) => (
                <div className={cn('flex ml-[-70px]', i !== game.hand_index && 'opacity-40')} key={i}>
                  {hand.map((card, j) => {
                    const sideways = game.bets[i] > game.starting_bet && j === hand.length - 1;
                    return (
                      <div key={j} className='w-7 overflow-visible' style={{ zIndex: i }}>
                        <Card card={card} sideways={sideways} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className='relative w-full flex justify-center min-h-6'>
              <div
                className={cn(
                  'transition-all text-center text-green-500 absolute',
                  lastDecisionFeedbackVisisble && lastDecision?.correct === true ? 'opacity-100' : 'opacity-0',
                )}
              >
                Correct!
              </div>
              <div
                className={cn(
                  'transition-all text-center text-red-500 absolute',
                  lastDecisionFeedbackVisisble && lastDecision?.correct === false ? 'opacity-100' : 'opacity-0',
                )}
              >
                Incorrect. You should have{' '}
                {match(lastDecision?.correctMove)
                  .with(PlayerAction.DoubleDown, () => 'doubled down')
                  .with(PlayerAction.Hit, () => 'hit')
                  .with(PlayerAction.Stand, () => 'stood')
                  .with(PlayerAction.Split, () => 'split')
                  .with(PlayerAction.Surrender, () => 'surrendered')
                  .otherwise(() => '')}
                .
              </div>
            </div>

            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-5 gap-1'>
                {[
                  PlayerAction.DoubleDown,
                  PlayerAction.Hit,
                  PlayerAction.Stand,
                  PlayerAction.Split,
                  PlayerAction.Surrender,
                ].map((action, i) => {
                  const isPlayerTurn = game.state === GameState.PlayerTurn;
                  const props: ButtonProps = {
                    children: playerActionToString(action),
                  };
                  props.disabled = !isPlayerTurn || !allowedActions.includes(action);
                  props.className = cn('h-24', props.disabled && 'opacity-50');
                  props.onClick = () => handlePlayerAction(action);
                  return <Button key={i} {...props} />;
                })}
              </div>
              <Button onClick={back} type='text'>
                Quit
              </Button>
            </div>
          </div>
        </main>

        <Modal open={gameOver} centered footer={null} onCancel={back} maskClosable={false}>
          {(() => {
            const { score, correctDecisions, incorrectDecisions, rawScore } = calculateScore(decisions);
            const highscore = Number(localStorage.getItem('highscore')) || 0;
            return (
              <div className='flex flex-col items-center gap-4'>
                <div className='flex flex-col items-center'>
                  <h2 className='text-2xl font-bold text-center'>
                    {highscoreBeatBy > 0 ? 'New highscore!' : 'Your score:'}
                  </h2>
                  <div className='text-4xl font-bold text-center mb-1'>{Math.round(score)}</div>
                  <div className='text-center mb-4'>
                    {highscoreBeatBy > 0
                      ? `Your old highscore was ${Math.round(score - highscoreBeatBy)}.`
                      : `Your highscore is ${Math.round(highscore)}`}
                  </div>
                  <div className='grid grid-cols-[auto_auto] gap-x-4'>
                    <div className='text-lg text-right'>Correct decisions:</div>
                    <div className='text-lg font-medium'>{correctDecisions}</div>
                    <div className='text-lg'>Incorrect decisions:</div>
                    <div className='text-lg font-medium'>
                      {incorrectDecisions}
                      {incorrectDecisions > 0 && (
                        <span className='text-red-500'>{` (-${Math.round(rawScore - score)} score penalty)`}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button onClick={init} color='priary'>
                    Play again
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      </>
    );
  }
}
function calculateScore(decisions: Decision[]) {
  const correctDecisions = decisions.filter((d) => d.playerMove === d.correctMove).length;
  const incorrectDecisions = decisions.filter((d) => d.playerMove !== d.correctMove).length;
  const decisionsPerSecond = correctDecisions / GAME_DURATION_SECONDS || 0;
  const rawScore = decisionsPerSecond * 1000;
  // 0% incorrect: player keeps 100% his score
  // 50% incorrect: player keeps 0% of his score
  const incorrectRatio = incorrectDecisions / (correctDecisions + incorrectDecisions);
  const incorrectDecisionsPenalty = clamp(0, 1, 1 - incorrectRatio / 0.5);
  const score = rawScore * incorrectDecisionsPenalty || 0;
  return { score, correctDecisions, incorrectDecisions, rawScore };
}
