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
import { rankToNumber, rankToString } from '@/utils/blackjack-utils';
import { Tooltip } from 'antd';
import { isNotNil, map, sum } from 'ramda';
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

  const graphData = entries.map(([key, value]) => ({
    x: key,
    y: value,
    color: key === 'B' ? ('red' as const) : ('green' as const),
  }));

  const bustChance = graphData[graphData.length - 1].y;
  const tooltip = (
    <div className='flex flex-col items-center gap-1'>
      <div>
        Safe: <span className='text-green-500'>{100 - bustChance}%</span> Bust:{' '}
        <span className='text-red-500'>{bustChance}%</span>
      </div>
      <div className='px-2'>
        <BarGraph data={graphData} />
      </div>
      <div>Your hand after hitting</div>
    </div>
  );
  return tooltip;
}
