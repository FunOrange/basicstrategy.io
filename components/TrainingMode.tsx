'use client';
import Card from '@/components/Card';
import FadeOut from '@/components/abstract/FadeOut';
import { rules } from '@/constants/blackjack-rules';
import useGameAudio from '@/hooks/useGameAudio';
import {
  GameState,
  PlayerAction,
  type BlackjackJsBindings as Blackjack,
  type BlackjackState,
} from '@/types/blackjack-analyzer-rs';
import { handOutcomeToString, playerActionToString } from '@/utils/blackjack-utils';
import { cn } from '@/utils/css';
import { sleep } from '@/utils/time';
import { Button, ButtonProps, Tag, TagProps } from 'antd';
import { useEffect, useState } from 'react';
import { Pattern, isMatching, match } from 'ts-pattern';

const GAME_TICK_MS = 260;

export interface TrainingModeProps {
  Blackjack: Blackjack;
  back: () => void;
}
export function TrainingMode({ Blackjack, back }: TrainingModeProps) {
  const play = useGameAudio();
  const [game, setGame] = useState<BlackjackState>();
  const [allowedActions, setAllowedActions] = useState<PlayerAction[]>([]);

  // #region player feedback
  const [lastDecision, setLastDecision] = useState<{ correct: boolean; correctMove: PlayerAction } | undefined>(
    undefined,
  );
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLastDecision(undefined);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [lastDecision]);
  // #endregion player feedback

  const init = () => {
    const bet = 1;
    let game = Blackjack.init_state(bet, rules);
    runUntilPlayerTurn(game);
  };
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayerAction = async (action: PlayerAction) => {
    const correctAction = Blackjack.get_optimal_move(game!);
    const actionIsCorrect = action === correctAction;
    if (action === PlayerAction.Hit) {
      play.dealCard();
    }
    if (actionIsCorrect) {
      play.correct();
    } else {
      play.incorrect();
    }
    setLastDecision({ correct: actionIsCorrect, correctMove: correctAction });
    let _game = Blackjack.next_state(game!, action);
    runUntilPlayerTurn(_game);
  };

  const runUntilPlayerTurn = async (game: BlackjackState) => {
    setGame(game);
    while (![GameState.PlayerTurn, GameState.GameOver].includes(game.state)) {
      await sleep(GAME_TICK_MS);
      console.debug('game.state', game.state);
      if (game.state === GameState.Dealing || game.state === GameState.DealerTurn) {
        play.dealCard();
      }
      game = Blackjack.next_state(game!);
      setGame(game);
    }
    if (game.state === GameState.PlayerTurn) {
      setAllowedActions(Blackjack.get_allowed_actions(game));
    }
  };

  if (game !== undefined) {
    return (
      <main className='flex flex-col items-center justify-between h-full max-h-[860px] py-16'>
        {/* top */}
        <div className='flex flex-col gap-6 items-center'>
          <div className='flex gap-2 min-h-[156px]'>
            {game.dealer_hand.map((card, i) => (
              <Card key={i} card={card} />
            ))}
          </div>

          {(() => {
            const dealerHandValue = Blackjack.get_dealer_hand_value(game);
            const color: TagProps['color'] = match(dealerHandValue)
              .with({ kind: 'Hard' }, (hand) =>
                hand.value === 2
                  ? 'blue'
                  : hand.value === 3
                  ? 'cyan'
                  : hand.value === 4
                  ? 'lime'
                  : [5, 6].includes(hand.value)
                  ? 'green'
                  : [7, 8, 9].includes(hand.value)
                  ? undefined
                  : hand.value === 10
                  ? 'red'
                  : undefined,
              )
              .with({ kind: 'Soft', value: 11 }, () => 'magenta')
              .with({ kind: 'Blackjack' }, () => 'warning')
              .otherwise(() => 'gray');
            return (
              <div>
                <Tag color={color}>
                  {match(dealerHandValue)
                    .with({ kind: 'Hard' }, (hand) => hand.value)
                    .with({ kind: 'Soft' }, (hand) => hand.value)
                    .with({ kind: 'Blackjack' }, () => 'Blackjack')
                    .otherwise(() => undefined)}
                </Tag>
              </div>
            );
          })()}
        </div>

        {/* middle */}
        <div className='text-center text-gray-500'>
          {game.state === GameState.GameOver &&
            (() => {
              const handOutcomes = Blackjack.get_game_outcome(game);
              if (handOutcomes.length === 1) {
                const handOutcome = handOutcomes[0];
                return handOutcomeToString(handOutcome);
              } else if (handOutcomes.length >= 2) {
                if (handOutcomes.every(isMatching({ kind: 'Surrendered' }))) {
                  return 'Surrendered.';
                } else {
                  return handOutcomes.map((handOutcome, i) =>
                    match(handOutcome)
                      .with({ kind: 'Won', reason: Pattern.any }, () => `Hand ${i + 1} won!`)
                      .with({ kind: 'Lost', reason: Pattern.any }, () => `Hand ${i + 1} lost.`)
                      .with({ kind: 'Push' }, () => `Hand ${i + 1} push.`)
                      .with({ kind: 'Surrendered' }, () => 'Surrender.')
                      .exhaustive(),
                  );
                }
              }
            })()}
        </div>

        {/* bottom */}
        <div className='flex flex-col items-center gap-4'>
          {(() => {
            const playerHandValue = Blackjack.get_player_hand_value(game);
            const color: TagProps['color'] = match(playerHandValue)
              .with({ kind: 'Hard' }, (hand) =>
                hand.value <= 2
                  ? undefined
                  : [9, 10, 11].includes(hand.value)
                  ? 'green'
                  : [12, 13, 14, 15, 16].includes(hand.value)
                  ? 'yellow'
                  : hand.value >= 17
                  ? 'red'
                  : undefined,
              )
              .with({ kind: 'Soft', value: 19 }, () => 'red')
              .with({ kind: 'Soft', value: 20 }, () => 'red')
              .with({ kind: 'Blackjack' }, () => 'warning')
              .otherwise(() => 'gray');
            return (
              <div>
                <Tag color={color}>
                  {match(playerHandValue)
                    .with({ kind: 'Hard' }, (hand) => hand.value)
                    .with({ kind: 'Soft' }, (hand) => `${hand.value - 10}/${hand.value}`)
                    .with({ kind: 'Blackjack' }, () => 'Blackjack')
                    .otherwise(() => undefined)}
                </Tag>
              </div>
            );
          })()}
          <div className='flex min-h-[156px] gap-x-60'>
            {game.player_hands.map((hand, i) => (
              <div className={cn('flex ml-[-70px]', i !== game.hand_index && 'opacity-40')} key={i}>
                {hand.map((card, j) => {
                  const sideways = game.bets[i] > game.starting_bet && j === hand.length - 1;
                  return (
                    <div key={j} className='w-7 overflow-visible' style={{ zIndex: j }}>
                      <Card card={card} sideways={sideways} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className='min-h-6'>
            <FadeOut isVisible={lastDecision !== undefined}>
              <div className={lastDecision?.correct ? 'text-green-500' : 'text-red-500'}>
                {lastDecision?.correct
                  ? 'Correct!'
                  : `Incorrect. You should have ${match(lastDecision?.correctMove)
                      .with(PlayerAction.DoubleDown, () => 'doubled down')
                      .with(PlayerAction.Hit, () => 'hit')
                      .with(PlayerAction.Stand, () => 'stood')
                      .with(PlayerAction.Split, () => 'split')
                      .with(PlayerAction.Surrender, () => 'surrendered')
                      .otherwise(() => '')}.`}
              </div>
            </FadeOut>
          </div>

          <div className='flex flex-col gap-4'>
            <div className='relative'>
              {game.state === GameState.GameOver && (
                <Button className='absolute w-full h-full z-10' onClick={init}>
                  Play again
                </Button>
              )}
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
            </div>
            <Button onClick={back} type='text'>
              Quit
            </Button>
          </div>
        </div>
      </main>
    );
  }
}
