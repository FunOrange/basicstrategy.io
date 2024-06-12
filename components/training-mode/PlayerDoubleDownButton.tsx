'use client';
import PlayerActionButton, { PlayerActionButtonProps } from '@/components/training-mode/PlayerActionButton';
import {
  PlayerAction,
  type BlackjackJsBindings as Blackjack,
  type BlackjackState,
} from '@/types/blackjack-analyzer-js-bindings';
import { Tooltip } from 'antd';

export interface PlayerDoubleDownButtonProps extends Omit<PlayerActionButtonProps, 'action'> {
  Blackjack: Blackjack;
  game: BlackjackState;
  handlePlayerAction: (action: PlayerAction) => void;
}
export default function PlayerDoubleDownButton(props: PlayerDoubleDownButtonProps) {
  const tooltip = 'Double';
  return (
    <Tooltip title={tooltip}>
      <PlayerActionButton action={PlayerAction.DoubleDown} {...props} />
    </Tooltip>
  );
}
