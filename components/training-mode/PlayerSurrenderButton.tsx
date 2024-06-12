'use client';
import PlayerActionButton, { PlayerActionButtonProps } from '@/components/training-mode/PlayerActionButton';
import {
  PlayerAction,
  type BlackjackJsBindings as Blackjack,
  type BlackjackState,
} from '@/types/blackjack-analyzer-js-bindings';
import { Tooltip } from 'antd';

export interface PlayerSurrenderButtonProps extends Omit<PlayerActionButtonProps, 'action'> {
  Blackjack: Blackjack;
  game: BlackjackState;
  handlePlayerAction: (action: PlayerAction) => void;
}
export default function PlayerSurrenderButton(props: PlayerSurrenderButtonProps) {
  const tooltip = 'Surrender';
  return (
    <Tooltip title={tooltip}>
      <PlayerActionButton action={PlayerAction.Surrender} {...props} />
    </Tooltip>
  );
}
