'use client';
import Card from '@/components/Card';
import { rules } from '@/constants/blackjack-rules';
import {
  GameState,
  PlayerAction,
  type BlackjackJsBindings as Blackjack,
  type BlackjackState,
} from '@/types/blackjack-analyzer-rs';
import { handOutcomeToString, playerActionToString } from '@/utils/blackjack-utils';
import { cn } from '@/utils/css';
import { sleep } from '@/utils/time';
import { Button, ButtonProps } from 'antd';
import { useEffect, useState } from 'react';

export function TrainingMode({ Blackjack }: { Blackjack: Blackjack }) {
  const [game, setGame] = useState<BlackjackState>();
  const [allowedActions, setAllowedActions] = useState<PlayerAction[]>([]);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = () => {
    const bet = 1;
    let game = Blackjack.init_state(bet, rules);
    runUntilPlayerTurn(game);
  };

  const handlePlayerAction = async (action: PlayerAction) => {
    let _game = Blackjack.next_state(game!, action);
    setGame(_game);
  };

  const runUntilPlayerTurn = async (game: BlackjackState) => {
    setGame(game);
    while (![GameState.PlayerTurn, GameState.GameOver].includes(game.state)) {
      await sleep(50);
      game = Blackjack.next_state(game!);
      setGame(game);
    }
    if (game.state === GameState.PlayerTurn) {
      setAllowedActions(Blackjack.get_allowed_actions(game));
    }
  };

  if (game !== undefined) {
    return (
      <main className='flex flex-col items-center justify-between h-full max-h-[860px] py-20'>
        {/* top */}
        <div className='flex gap-2'>
          {game.dealer_hand.map((card, i) => (
            <Card key={i} card={card} />
          ))}
        </div>

        {/* middle */}
        <div className='flex flex-col gap-4 text-center min-w-48'>
          {game.state === GameState.GameOver &&
            (() => {
              const handOutcomes = Blackjack.get_game_outcome(game);
              if (handOutcomes.length === 1) {
                const handOutcome = handOutcomes[0];
                return handOutcomeToString(handOutcome);
              } else if (handOutcomes.length >= 2) {
                return 'idk what to show here for multiple hands';
              }
            })()}
          {game.state === GameState.GameOver && <Button onClick={init}>Play again</Button>}
        </div>

        {/* bottom */}
        <div className='flex flex-col items-center gap-7'>
          <div className='flex gap-28'>
            {game.player_hands.map((hand, i) => (
              <div className={cn('flex gap-2 min-h-[156px]', i !== game.hand_index && 'opacity-40')} key={i}>
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
      </main>
    );
  }
}
