'use client';
import BarGraph from '@/components/BarGraph';
import PlayerActionButton, { PlayerActionButtonProps } from '@/components/training-mode/PlayerActionButton';
import {
  PlayerAction,
  type BlackjackJsBindings as Blackjack,
  type BlackjackState,
  GameState,
  Rank,
} from '@/types/blackjack-analyzer-js-bindings';
import { sumReducer } from '@/utils/array-utils';
import { handValueToString, hitPdf, rankToNumber, rankToString } from '@/utils/blackjack-utils';
import { Tooltip } from 'antd';
import { is, isNotNil, map, sum } from 'ramda';
import { ReactNode, useState } from 'react';
import { isMatching, match } from 'ts-pattern';

export interface PlayerHitButtonProps extends Omit<PlayerActionButtonProps, 'action'> {
  Blackjack: Blackjack;
  game: BlackjackState;
  handlePlayerAction: (action: PlayerAction) => void;
}
export default function PlayerHitButton(props: PlayerHitButtonProps) {
  const isPlayerTurn = props.game.state === GameState.PlayerTurn;
  const allowedActions = isPlayerTurn ? props.Blackjack.get_allowed_actions(props.game) : [];
  const disabled = !isPlayerTurn || !allowedActions.includes(PlayerAction.Hit);
  const [tooltip, setTooltip] = useState<ReactNode>(undefined);
  return (
    <div
      className='w-full'
      onMouseEnter={() => {
        if (isPlayerTurn) setTooltip(renderHitTooltip(props.Blackjack, props.game));
      }}
      onMouseLeave={() => setTooltip(undefined)}
      onClick={() => setTooltip(undefined)}
    >
      <Tooltip trigger='hover' placement='bottom' open={!disabled && isNotNil(tooltip)} title={tooltip}>
        <PlayerActionButton action={PlayerAction.Hit} {...props} />
      </Tooltip>
    </div>
  );
}
function renderHitTooltip(Blackjack: Blackjack, game: BlackjackState) {
  const playerHandValue = Blackjack.get_player_hand_value(game);
  const playerHandNumber =
    match(playerHandValue)
      .with({ kind: 'Hard' }, ({ value }) => value)
      .with({ kind: 'Soft' }, ({ value }) => value)
      .otherwise(() => undefined) ?? 0;

  const softToHard = (hand: string | number) =>
    typeof hand === 'string' && hand.startsWith('S')
      ? parseInt(hand.slice(1))
      : typeof hand === 'string'
      ? ('B' as const)
      : hand;

  let pdf = hitPdf(Blackjack, game);

  const isStronger = (key: string | number) => {
    const hard = softToHard(key);
    return hard !== 'B' && hard > playerHandNumber;
  };
  const isSame = (key: string | number) => softToHard(key) === playerHandNumber;
  const isWeaker = (key: string | number) => {
    const hard = softToHard(key);
    return hard !== 'B' && hard < playerHandNumber;
  };
  const graphData = pdf.map(([key, value]) => ({
    x: key,
    y: Math.round(value),
    color:
      key === 'B'
        ? ('red' as const)
        : isStronger(key)
        ? ('green-200' as const)
        : isWeaker(key)
        ? ('white' as const)
        : ('yellow' as const),
  }));

  const strongerChance = pdf
    .filter(([x]) => isStronger(x))
    .map(([x, y]) => y)
    .reduce(sumReducer, 0);
  const sameChance = pdf.find(([x]) => isSame(x))?.[1] ?? 0;
  const bustChance = pdf.find(([x]) => x === 'B')?.[1] ?? 0;
  const tooltip = (
    <div className='flex flex-col items-center px-4'>
      <div className='mb-2'>
        {strongerChance > 0 && (
          <>
            Improved hand: <span className='text-green-200'>{Math.round(strongerChance)}%</span>{' '}
          </>
        )}
        {sameChance > 0 && (
          <>
            Same: <span className='text-yellow-500'>{Math.round(sameChance)}%</span>{' '}
          </>
        )}
        {bustChance > 0 && (
          <>
            Bust: <span className='text-red-500'>{Math.round(bustChance)}%</span>{' '}
          </>
        )}
      </div>
      <div className='px-2'>
        <BarGraph data={graphData} />
      </div>
    </div>
  );
  return tooltip;
}
