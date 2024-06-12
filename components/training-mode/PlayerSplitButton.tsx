'use client';
import PlayerActionButton, { PlayerActionButtonProps } from '@/components/training-mode/PlayerActionButton';
import {
  PlayerAction,
  type BlackjackJsBindings as Blackjack,
  type BlackjackState,
} from '@/types/blackjack-analyzer-js-bindings';
import { Tooltip } from 'antd';

export interface PlayerSplitButtonProps extends Omit<PlayerActionButtonProps, 'action'> {
  Blackjack: Blackjack;
  game: BlackjackState;
  handlePlayerAction: (action: PlayerAction) => void;
}
export default function PlayerSplitButton(props: PlayerSplitButtonProps) {
  const tooltip = 'Split';
  return (
    <Tooltip title={tooltip}>
      <PlayerActionButton action={PlayerAction.Split} {...props} />
    </Tooltip>
  );
}
