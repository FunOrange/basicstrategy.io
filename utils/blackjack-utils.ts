import {
  BlackjackState,
  Card,
  HandOutcome,
  LossReason,
  PlayerAction,
  Rank,
  WinReason,
} from '@/types/blackjack-analyzer-rs';
import { match } from 'ts-pattern';

export const playerActionToString = (playerAction: PlayerAction | undefined) =>
  playerAction
    ? match(playerAction)
        .with(PlayerAction.DoubleDown, () => 'Double')
        .with(PlayerAction.Hit, () => 'Hit')
        .with(PlayerAction.Stand, () => 'Stand')
        .with(PlayerAction.Split, () => 'Split')
        .with(PlayerAction.Surrender, () => 'Surrender')
        .exhaustive()
    : '';

export const handOutcomeToString = (handOutcome: HandOutcome) =>
  match(handOutcome)
    .with({ kind: 'Won', reason: WinReason.Blackjack }, () => 'Blackjack!')
    .with({ kind: 'Won', reason: WinReason.DealerBust }, () => 'Dealer bust!')
    .with({ kind: 'Won', reason: WinReason.HigherHand }, () => 'You won!')
    .with({ kind: 'Lost', reason: LossReason.Bust }, () => 'Bust.')
    .with({ kind: 'Lost', reason: LossReason.DealerBlackjack }, () => 'Dealer got blackjack.')
    .with({ kind: 'Lost', reason: LossReason.LowerHand }, () => 'You lost.')
    .with({ kind: 'Push' }, () => 'Push.')
    .with({ kind: 'Surrendered' }, () => 'Surrender.')
    .exhaustive();

export const playerWillBeDealtBlackjack = (game: BlackjackState) => {
  const [playerCard1, _1, playerCard2, _2] = game.shoe.slice(-4).reverse();
  return isBlackjack([playerCard1, playerCard2]);
};

export const dealerWillBeDealtBlackjack = (game: BlackjackState) => {
  const [_1, dealerCard1, _2, dealerCard2] = game.shoe.slice(-4).reverse();
  return isBlackjack([dealerCard1, dealerCard2]);
};

const isBlackjack = (hand: Card[]) =>
  hand.length === 2 &&
  match([hand[0].rank, hand[1].rank])
    .with([Rank.Ace, Rank.Ten], () => true)
    .with([Rank.Ten, Rank.Ace], () => true)
    .with([Rank.Ace, Rank.Jack], () => true)
    .with([Rank.Jack, Rank.Ace], () => true)
    .with([Rank.Ace, Rank.Queen], () => true)
    .with([Rank.Queen, Rank.Ace], () => true)
    .with([Rank.Ace, Rank.King], () => true)
    .with([Rank.King, Rank.Ace], () => true)
    .otherwise(() => false);
