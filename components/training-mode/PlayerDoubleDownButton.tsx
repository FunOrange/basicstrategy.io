'use client';
import BarGraph from '@/components/BarGraph';
import PlayerActionButton, { PlayerActionButtonProps } from '@/components/training-mode/PlayerActionButton';
import {
  PlayerAction,
  type BlackjackJsBindings as Blackjack,
  type BlackjackState,
  GameState,
} from '@/types/blackjack-analyzer-js-bindings';
import { sumReducer } from '@/utils/array-utils';
import { dealerHandPdf, hitPdf } from '@/utils/blackjack-utils';
import { Tooltip } from 'antd';
import { isNotNil, sum } from 'ramda';
import { ReactNode, useState } from 'react';
import { isMatching, match } from 'ts-pattern';

export interface PlayerDoubleDownButtonProps extends Omit<PlayerActionButtonProps, 'action'> {
  Blackjack: Blackjack;
  game: BlackjackState;
  handlePlayerAction: (action: PlayerAction) => void;
}
export default function PlayerDoubleDownButton(props: PlayerDoubleDownButtonProps) {
  const isPlayerTurn = props.game.state === GameState.PlayerTurn;
  const allowedActions = isPlayerTurn ? props.Blackjack.get_allowed_actions(props.game) : [];
  const disabled = !isPlayerTurn || !allowedActions.includes(PlayerAction.DoubleDown);
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
        <PlayerActionButton action={PlayerAction.DoubleDown} {...props} />
      </Tooltip>
    </div>
  );
}

function renderHitTooltip(Blackjack: Blackjack, game: BlackjackState) {
  const iterations = 100_000;
  const { pdf: dealerPdf, runtimeMs } = dealerHandPdf(Blackjack, game, iterations);
  const playerPdf = hitPdf(Blackjack, game);
  const playerPdfHard: [number | 'B', number][] = playerPdf.filter(
    ([key]) => !(typeof key === 'string' && key.startsWith('S')),
  ) as [number | 'B', number][];
  for (const [hand, probability] of playerPdf) {
    if (typeof hand === 'string' && hand.startsWith('S')) {
      const hardValue = parseInt(hand.slice(1));
      const existingEntry = playerPdfHard.find(([key]) => key === hardValue);
      if (existingEntry) {
        existingEntry[1] += probability;
      } else {
        playerPdfHard.push([hardValue, probability]);
      }
    }
  }

  const P_x = (x: number | 'B') => (playerPdfHard.find(([key]) => key === x)?.[1] ?? 0) / 100;
  const P_y = (y: number | 'B') => (dealerPdf.find(({ x }) => x === y)?.y ?? 0) / 100;

  const winChance = sum([
    P_x(1) * P_y('B'),
    P_x(2) * P_y('B'),
    P_x(3) * P_y('B'),
    P_x(4) * P_y('B'),
    P_x(5) * P_y('B'),
    P_x(6) * P_y('B'),
    P_x(7) * P_y('B'),
    P_x(8) * P_y('B'),
    P_x(9) * P_y('B'),
    P_x(10) * P_y('B'),
    P_x(11) * P_y('B'),
    P_x(12) * P_y('B'),
    P_x(13) * P_y('B'),
    P_x(14) * P_y('B'),
    P_x(15) * P_y('B'),
    P_x(16) * P_y('B'),
    P_x(17) * P_y('B'),
    P_x(18) * (P_y(17) + P_y('B')),
    P_x(19) * (P_y(17) + P_y(18) + P_y('B')),
    P_x(20) * (P_y(17) + P_y(18) + P_y(19) + P_y('B')),
    P_x(21) * (P_y(17) + P_y(18) + P_y(19) + P_y(20) + P_y('B')),
  ]);
  const pushChance = sum([
    P_x(17) * P_y(17),
    P_x(18) * P_y(18),
    P_x(19) * P_y(19),
    P_x(20) * P_y(20),
    P_x(21) * P_y(21),
  ]);
  const loseChance = 1 - winChance - pushChance;

  // dealer graph
  let dealerGraphData = dealerPdf.map(({ x, y }) => ({
    x,
    y: Math.round(y),
    color: x === 'B' ? ('green' as const) : ('white' as const),
  }));
  const leftPadding: typeof dealerGraphData = [];
  const softToHard = (x: string | number) =>
    typeof x === 'string' && x.startsWith('S') ? parseInt(x.slice(1)) : (x as number);
  for (const key of playerPdf.map(([key]) => (key !== 'B' ? key : undefined)).filter(Boolean)) {
    if (key !== undefined) {
      const hard = softToHard(key);
      if (!dealerPdf.find(({ x }) => x === hard)) {
        leftPadding.push({ x: hard, y: 0, color: 'white' });
      }
    }
  }
  dealerGraphData = [...leftPadding, ...dealerGraphData];

  // player graph
  let playerGraphData = playerPdf.map(([key, value]) => ({
    x: key,
    y: Math.round(value),
    color: key === 'B' ? ('red' as const) : ('white' as const),
  }));
  const paddedPlayerGraphData: typeof playerGraphData = [];
  for (const { x } of dealerGraphData) {
    const existingDataPoint = playerGraphData.find(({ x: x2 }) => x2 === x || x2 === `S${x}`);
    const y = existingDataPoint?.y ?? 0;
    const color = existingDataPoint?.color ?? 'white';
    paddedPlayerGraphData.push({ x: existingDataPoint?.x ?? x, y, color });
  }
  for (const { x, y, color } of playerGraphData) {
    if (!paddedPlayerGraphData.find(({ x: x2 }) => x === x2)) {
      paddedPlayerGraphData.push({ x, y, color });
    }
  }
  playerGraphData = paddedPlayerGraphData;
  playerGraphData.sort((a, b) => (a.x === 'B' ? 1 : b.x === 'B' ? -1 : softToHard(a.x) - softToHard(b.x)));

  const tooltip = (
    <div className='flex flex-col items-center px-4'>
      <div className='mb-2'>
        {winChance > 0 && (
          <>
            Win: <span className='text-green-500'>{Math.round(winChance * 100)}%</span>{' '}
          </>
        )}
        {pushChance > 0 && (
          <>
            Push: <span className='text-yellow-500'>{Math.round(pushChance * 100)}%</span>{' '}
          </>
        )}
        {loseChance > 0 && (
          <>
            Lose: <span className='text-red-500'>{Math.round(loseChance * 100)}%</span>{' '}
          </>
        )}
      </div>

      <div className='grid grid-cols-[auto_1fr] items-center justify-end'>
        <div className='font-bold mt-6 pr-4 text-right'>Dealer&apos;s hand will be:</div>
        <BarGraph data={dealerGraphData} />

        <div className='font-bold mt-6 pr-4 text-right'>Your hand will be:</div>
        <BarGraph data={playerGraphData} />
      </div>

      <div className='text-xs opacity-50'>
        Ran {iterations.toLocaleString()} simulations in {runtimeMs.toFixed(2)} ms
      </div>
    </div>
  );
  return tooltip;
}
