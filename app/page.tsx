'use client';
import {
  type BlackjackJsBindings as Blackjack,
  type BlackjackState,
  GameState,
  type HandOutcome,
  LossReason,
  PlayerAction,
  WinReason,
  type BlackjackRuleset,
  DoubleDownOn,
  MaxHandsAfterSplit,
  SplitAces,
} from '@/types/blackjack-analyzer-rs';
import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import { sleep } from '@/utils/time';
import { match } from 'ts-pattern';
import { cn } from '@/utils/css';
import { Button, ButtonProps } from 'antd';

export default function Home() {
  const [Blackjack, setBlackjack] = useState<Blackjack>();
  useEffect(() => {
    (async () => {
      const Blackjack = await import('@/local_packages/blackjack-analyzer-rs');
      setBlackjack(Blackjack as any as Blackjack);
    })();
  }, []);

  return (
    <main className='flex items-center justify-center w-screen h-screen'>
      {Boolean(Blackjack) && <Game Blackjack={Blackjack!} />}
    </main>
  );
}

function Game({ Blackjack }: { Blackjack: Blackjack }) {
  const [game, setGame] = useState<BlackjackState>();
  const [allowedActions, setAllowedActions] = useState<PlayerAction[]>([]);

  const startGame = async () => {
    const rules: BlackjackRuleset = Blackjack.create_ruleset(
      /*surrender*/ true,
      /*dealer_stands_on_all_17*/ true,
      /*dealer_peeks*/ true,
      /*split_aces*/ SplitAces.Twice,
      /*hit_on_split_ace*/ false,
      /*max_hands_after_split*/ MaxHandsAfterSplit.Three,
      /*double_down_on*/ DoubleDownOn.Any,
      /*double_after_split*/ true,
      /*double_on_split_ace*/ false,
      /*blackjack_payout*/ 3.0 / 2.0,
      /*ace_and_ten_counts_as_blackjack*/ true,
      /*split_ace_can_be_blackjack*/ false,
    );
    let game = Blackjack.init_state(1, rules);
    setGame(game);
    while (![GameState.PlayerTurn, GameState.GameOver].includes(game.state)) {
      await sleep(200);
      game = nextState(game);
    }
  };

  const nextState = (game: BlackjackState, action?: PlayerAction): BlackjackState => {
    const _game = Blackjack.next_state(game!, action);
    setGame(_game);
    if (_game.state === GameState.PlayerTurn) {
      const allowed_actions = Blackjack.allowed_actions(_game);
      setAllowedActions(allowed_actions);
    }
    return _game;
  };

  const handlePlayerAction = async (action: PlayerAction) => {
    let _game = Blackjack.next_state(game!, action);
    setGame(_game);
    while (![GameState.PlayerTurn, GameState.GameOver].includes(_game.state)) {
      await sleep(200);
      _game = nextState(_game);
    }
  };

  const monteCarlo = () => {
    const iterations = 130_000;
    console.time(iterations.toLocaleString());
    Blackjack.monte_carlo(iterations);
    console.timeEnd(iterations.toLocaleString());
  };

  if (!game) {
    return (
      <>
        <Button onClick={startGame}>Start game</Button>
      </>
    );
  } else if (game !== undefined) {
    return (
      <main className='flex flex-col items-center justify-between h-full max-h-[860px] py-20'>
        <div className='flex gap-2'>
          {/* dealer hand */}
          {game.dealer_hand.map((card, i) => (
            <Card key={i} card={card} />
          ))}
        </div>

        <div className='flex flex-col gap-4 text-center min-w-48'>
          {game.state === GameState.GameOver &&
            (() => {
              const handOutcomes = Blackjack.game_outcome(game);
              const handOutcomeString = (handOutcome: HandOutcome) =>
                match(handOutcome)
                  .with({ kind: 'Won', reason: WinReason.Blackjack }, () => 'Blackjack! You won!')
                  .with({ kind: 'Won', reason: WinReason.DealerBust }, () => 'Dealer bust! You won!')
                  .with({ kind: 'Won', reason: WinReason.HigherHand }, () => 'You won!')
                  .with({ kind: 'Lost', reason: LossReason.Bust }, () => 'Bust.')
                  .with({ kind: 'Lost', reason: LossReason.DealerBlackjack }, () => 'Dealer got blackjack.')
                  .with({ kind: 'Lost', reason: LossReason.LowerHand }, () => 'You lost.')
                  .with({ kind: 'Push' }, () => 'Push.')
                  .with({ kind: 'Surrendered' }, () => 'Surrender.')
                  .exhaustive();
              if (handOutcomes.length === 1) {
                const handOutcome = handOutcomes[0];
                return handOutcomeString(handOutcome);
              } else if (handOutcomes.length >= 2) {
                return 'idk what to show here for multiple hands';
              }
            })()}
          {game.state === GameState.GameOver && <Button onClick={() => startGame()}>Play again</Button>}
        </div>
        <div className='flex flex-col items-center gap-7'>
          {/* player hands */}
          <div className='flex gap-28'>
            {game.player_hands.map((hand, i) => (
              <div className='flex gap-2' key={i}>
                {hand.map((card, i) => (
                  <Card key={i} card={card} />
                ))}
              </div>
            ))}
          </div>
          <div className='grid grid-cols-5 gap-1'>
            {[
              PlayerAction.DoubleDown,
              PlayerAction.Hit,
              PlayerAction.Stand,
              PlayerAction.Split,
              PlayerAction.Surrender,
            ].map((action, i) => {
              const isPlayerTurn = game.state === GameState.PlayerTurn;
              const props: ButtonProps = match(action)
                .with(PlayerAction.DoubleDown, () => ({ children: 'Double' }))
                .with(PlayerAction.Hit, () => ({ children: 'Hit' }))
                .with(PlayerAction.Stand, () => ({ children: 'Stand' }))
                .with(PlayerAction.Split, () => ({ children: 'Split' }))
                .with(PlayerAction.Surrender, () => ({ children: 'Surrender' }))
                .exhaustive();
              props.disabled = !isPlayerTurn || !allowedActions.includes(action);
              props.className = cn('h-24', props.disabled && 'opacity-50');
              props.onClick = () => handlePlayerAction(action);
              return <Button key={i} {...props}></Button>;
            })}
          </div>
        </div>
      </main>
    );
  }
}
