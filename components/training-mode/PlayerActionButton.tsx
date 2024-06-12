import {
  GameState,
  PlayerAction,
  type BlackjackJsBindings as Blackjack,
  type BlackjackState,
  Rank,
} from '@/types/blackjack-analyzer-js-bindings';
import { playerActionToString } from '@/utils/blackjack-utils';
import { cn } from '@/utils/css';
import { Button, ButtonProps } from 'antd';

export interface PlayerActionButtonProps {
  Blackjack: Blackjack;
  game: BlackjackState;
  action: PlayerAction;
  handlePlayerAction: (action: PlayerAction) => void;
}
export default function PlayerActionButton({ Blackjack, game, action, handlePlayerAction }: PlayerActionButtonProps) {
  const isPlayerTurn = game?.state === GameState.PlayerTurn;
  const allowedActions = isPlayerTurn ? Blackjack.get_allowed_actions(game) : [];

  return (
    <Button
      disabled={!isPlayerTurn || !allowedActions.includes(action)}
      className={cn('w-full h-24', (!isPlayerTurn || !allowedActions.includes(action)) && 'opacity-50')}
      onClick={() => handlePlayerAction(action)}
    >
      {playerActionToString(action)}
    </Button>
  );
}
