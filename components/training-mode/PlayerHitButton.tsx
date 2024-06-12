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
import { handValueToString, rankToNumber, rankToString } from '@/utils/blackjack-utils';
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
  const [tooltip, setTooltip] = useState<ReactNode>(undefined);
  return (
    <div
      className='w-full'
      onMouseEnter={() => {
        if (isPlayerTurn) setTooltip(renderHitTooltip(props.Blackjack, props.game));
      }}
      onMouseLeave={() => setTooltip(undefined)}
    >
      <Tooltip trigger='hover' placement='bottom' open={isPlayerTurn && isNotNil(tooltip)} title={tooltip}>
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

  let entries: [string, number][] = [];
  if (isMatching({ kind: 'Soft' }, playerHandValue)) {
    for (let card = 1; card <= 10; card++) {
      const probability = card === 10 ? 4 / 13 : 1 / 13;
      const withAceAsTen = playerHandNumber + card;
      const withAceAsOne = playerHandNumber + card - 10;
      const key = withAceAsTen < 21 ? `S${withAceAsTen}` : withAceAsOne <= 21 ? withAceAsOne.toString() : 'B';
      if (key === 'B') {
        const existingEntry = entries.find(([key]) => key === 'B');
        if (existingEntry) {
          existingEntry[1] += probability * 100;
        } else {
          entries.push(['B', probability * 100]);
        }
      } else {
        entries.push([key, probability * 100]);
      }
    }
  } else if (isMatching({ kind: 'Hard' }, playerHandValue)) {
    for (let card = 1; card <= 10; card++) {
      const probability = card === 10 ? 4 / 13 : 1 / 13;
      const afterHit = playerHandNumber + card;
      const key = afterHit <= 21 ? afterHit.toString() : 'B';
      if (key === 'B') {
        const existingEntry = entries.find(([key]) => key === 'B');
        if (existingEntry) {
          existingEntry[1] += probability * 100;
        } else {
          entries.push(['B', probability * 100]);
        }
      } else {
        entries.push([key, probability * 100]);
      }
    }
  }
  entries = entries.map(([key, value]) => [key, Math.round(value)]);

  const isStronger = (key: string) => parseInt(key.replace('S', '')) > playerHandNumber;
  const isSame = (key: string) => parseInt(key.replace('S', '')) === playerHandNumber;
  const isWeaker = (key: string) => parseInt(key.replace('S', '')) < playerHandNumber;
  const isBust = (key: string) => key === 'B';
  const graphData = entries.map(([key, value]) => ({
    x: key,
    y: value,
    color: isBust(key)
      ? ('red' as const)
      : isStronger(key)
      ? ('green' as const)
      : isWeaker(key)
      ? ('white' as const)
      : ('yellow' as const),
  }));

  const strongerChance = graphData
    .filter(({ x }) => isStronger(x))
    .map(({ y }) => y)
    .reduce(sumReducer, 0);
  const sameChance = graphData.find(({ x }) => isSame(x))?.y ?? 0;
  const bustChance = graphData.find(({ x }) => x === 'B')?.y ?? 0;
  const tooltip = (
    <div className='flex flex-col items-center gap-1'>
      <div>
        {strongerChance > 0 && (
          <>
            Stronger: <span className='text-green-500'>{strongerChance}%</span>{' '}
          </>
        )}
        {sameChance > 0 && (
          <>
            Same: <span className='text-yellow-500'>{sameChance}%</span>{' '}
          </>
        )}
        {bustChance > 0 && (
          <>
            Bust: <span className='text-red-500'>{bustChance}%</span>{' '}
          </>
        )}
      </div>
      <div className='px-2'>
        <BarGraph data={graphData} />
      </div>
      <div>
        Your hand after hitting on <span className='font-bold'>{handValueToString(playerHandValue)}</span>
      </div>
    </div>
  );
  return tooltip;
}
