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
import { dealerHandPdf, rankToNumber, rankToString } from '@/utils/blackjack-utils';
import { Tooltip } from 'antd';
import { isNotNil, sum } from 'ramda';
import { ReactNode, useState } from 'react';
import { match } from 'ts-pattern';

export interface PlayerStandButtonProps extends Omit<PlayerActionButtonProps, 'action'> {
  handlePlayerAction: (action: PlayerAction) => void;
}
export default function PlayerStandButton(props: PlayerStandButtonProps) {
  const isPlayerTurn = props.game.state === GameState.PlayerTurn;
  const allowedActions = isPlayerTurn ? props.Blackjack.get_allowed_actions(props.game) : [];
  const disabled = !isPlayerTurn || !allowedActions.includes(PlayerAction.Stand);
  const [tooltip, setTooltip] = useState<ReactNode>(undefined);
  return (
    <div
      className='w-full'
      onMouseEnter={() => {
        if (isPlayerTurn) setTooltip(renderStandTooltip(props.Blackjack, props.game));
      }}
      onMouseLeave={() => setTooltip(undefined)}
      onClick={() => setTooltip(undefined)}
    >
      <Tooltip trigger='hover' placement='bottom' open={!disabled && isNotNil(tooltip)} title={tooltip}>
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

  const isWin = (x: number | 'B') => x === 'B' || x < playerHandNumber;
  const isPush = (x: number | 'B') => x === playerHandNumber;
  const isLose = (x: number | 'B') => x !== 'B' && x > playerHandNumber;

  // #region simulation
  const iterations = 100_000;
  const { pdf, runtimeMs } = dealerHandPdf(Blackjack, game, 100_000);
  const graphData = pdf.map(({ x, y }) => ({
    x,
    y: Math.round(y),
    color: isWin(x) ? ('green' as const) : isPush(x) ? ('yellow' as const) : ('red' as const),
  }));
  // #endregion simulation

  const winChance = Math.round(sum(pdf.filter(({ x, y }) => isWin(x)).map(({ x, y }) => y)));
  const pushChance = Math.round(sum(pdf.filter(({ x, y }) => isPush(x)).map(({ x, y }) => y)));
  const loseChance = Math.round(sum(pdf.filter(({ x, y }) => isLose(x)).map(({ x, y }) => y)));
  const tooltip = (
    <div className='flex flex-col items-center gap-1 px-4'>
      {lessThan17 ? (
        <div>
          Win: <span className='text-green-500'>{winChance}%</span> Lose:{' '}
          <span className='text-red-500'>{loseChance}%</span>
        </div>
      ) : (
        <div>
          Win: <span className='text-green-500'>{winChance}%</span> Push:{' '}
          <span className='text-yellow-500'>{pushChance}%</span> Lose:{' '}
          <span className='text-red-500'>{loseChance}%</span>
        </div>
      )}
      <div>
        When dealer has <b>{rankToString(game.dealer_hand[0]?.rank ?? Rank.Two, true)}</b>, his final hand will be:
      </div>
      <div>
        <BarGraph data={graphData} />
      </div>
      <div className='text-xs opacity-50'>
        Ran {iterations.toLocaleString()} simulations in {runtimeMs.toFixed(2)} ms
      </div>
    </div>
  );
  return tooltip;
}
