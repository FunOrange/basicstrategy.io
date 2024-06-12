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
import { isNotNil, sum } from 'ramda';
import { ReactNode, useState } from 'react';
import { match } from 'ts-pattern';

export interface PlayerStandButtonProps extends Omit<PlayerActionButtonProps, 'action'> {
  handlePlayerAction: (action: PlayerAction) => void;
}
export default function PlayerStandButton(props: PlayerStandButtonProps) {
  const isPlayerTurn = props.game.state === GameState.PlayerTurn;
  const [tooltip, setTooltip] = useState<ReactNode>(undefined);
  return (
    <div
      className='w-full'
      onMouseEnter={() => {
        if (isPlayerTurn) setTooltip(renderStandTooltip(props.Blackjack, props.game));
      }}
      onMouseLeave={() => setTooltip(undefined)}
    >
      <Tooltip trigger='hover' placement='bottom' open={isPlayerTurn && isNotNil(tooltip)} title={tooltip}>
        <PlayerActionButton action={PlayerAction.Stand} {...props} />
      </Tooltip>
    </div>
  );
}

function renderStandTooltip(Blackjack: Blackjack, game: BlackjackState) {
  const playerHandValue = Blackjack.get_player_hand_value(game);
  const playerHandNumber =
    match(playerHandValue)
      .with({ kind: 'Hard' }, ({ value }) => value)
      .with({ kind: 'Soft' }, ({ value }) => value)
      .otherwise(() => undefined) ?? 0;
  const lessThan17 = playerHandNumber < 17;

  const iterations = 100_000;
  const { results, runtimeMs } = (() => {
    if (game.state === GameState.PlayerTurn) {
      const startTime = performance.now();
      const results = Blackjack.simulate_dealer_stand_outcome(rankToNumber(game.dealer_hand[0].rank), iterations);
      const endTime = performance.now();
      return { results, runtimeMs: endTime - startTime };
    } else {
      return { results: new Map(), runtimeMs: 0 };
    }
  })();
  const entries = Array.from(results.entries());
  const truncatedEntries = entries.filter(([key]) => key <= 21);
  truncatedEntries.push(['B', entries.filter(([key]) => key > 21).reduce((acc, [, value]) => acc + value, 0)]);
  const simulationResults = truncatedEntries
    .map(([key, value]) => {
      const normalizedY = value / iterations;
      return {
        x: key,
        y: Math.round(normalizedY * 100),
        color:
          key < playerHandNumber || key === 'B'
            ? ('green' as const)
            : key === playerHandNumber
            ? ('yellow' as const)
            : ('red' as const),
      };
    })
    .sort((a, b) => (a.x === 'B' ? 1 : b.x === 'B' ? -1 : a.x - b.x));

  const winChance = sum(simulationResults.filter(({ x, y }) => x < playerHandNumber || x === 'B').map(({ x, y }) => y));
  const pushChance = sum(simulationResults.filter(({ x, y }) => x === playerHandNumber).map(({ x, y }) => y));
  const loseChance = sum(
    simulationResults.filter(({ x, y }) => x > playerHandNumber && x !== 'B').map(({ x, y }) => y),
  );
  const tooltip = (
    <div className='flex flex-col items-center gap-1'>
      {lessThan17 ? (
        <div>
          Win: <span className='text-green-500'>{winChance}%</span>, Lose:{' '}
          <span className='text-red-500'>{loseChance}%</span>
        </div>
      ) : (
        <div>
          Win: <span className='text-green-500'>{winChance}%</span>, Push:{' '}
          <span className='text-yellow-500'>{pushChance}%</span>, Lose:{' '}
          <span className='text-red-500'>{loseChance}%</span>
        </div>
      )}
      <div className='px-2'>
        <BarGraph data={simulationResults} />
      </div>
      <div>
        Dealer&apos;s final hand when the dealer&apos;s upcard is{' '}
        <b>{rankToString(game.dealer_hand[0]?.rank ?? Rank.Two, true)}</b>
      </div>
      <div className='text-xs opacity-50'>
        Ran {iterations.toLocaleString()} simulations in {runtimeMs.toFixed(2)} ms
      </div>
    </div>
  );
  return tooltip;
}
