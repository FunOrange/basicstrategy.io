import { HandOutcome, LossReason, PlayerAction, WinReason } from '@/types/blackjack-analyzer-rs';
import { match } from 'ts-pattern';

export const playerActionToString = (playerAction: PlayerAction) =>
  match(playerAction)
    .with(PlayerAction.DoubleDown, () => 'Double')
    .with(PlayerAction.Hit, () => 'Hit')
    .with(PlayerAction.Stand, () => 'Stand')
    .with(PlayerAction.Split, () => 'Split')
    .with(PlayerAction.Surrender, () => 'Surrender')
    .exhaustive();

export const handOutcomeToString = (handOutcome: HandOutcome) =>
  match(handOutcome)
    .with({ kind: 'Won', reason: WinReason.Blackjack }, () => 'Blackjack! You won!')
    .with({ kind: 'Won', reason: WinReason.DealerBust }, () => 'Dealer bust! You won!')
    .with({ kind: 'Won', reason: WinReason.HigherHand }, () => 'You won!')
    .with({ kind: 'Lost', reason: LossReason.Bust }, () => 'Bust.')
    .with({ kind: 'Lost', reason: LossReason.DealerBlackjack }, () => 'Dealer got blackjack.')
    .with({ kind: 'Lost', reason: LossReason.LowerHand }, () => 'You lost.')
    .with({ kind: 'Push' }, () => 'Push.')
    .with({ kind: 'Surrendered' }, () => 'Surrender.')
    .exhaustive();
