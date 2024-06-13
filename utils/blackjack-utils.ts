import {
  type BlackjackJsBindings as Blackjack,
  BlackjackState,
  Card,
  HandOutcome,
  HandValue,
  LossReason,
  PlayerAction,
  Rank,
  WinReason,
} from '@/types/blackjack-analyzer-js-bindings';
import { isMatching, match } from 'ts-pattern';

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
    .with({ kind: 'Lost', reason: LossReason.DealerBlackjack }, () => 'Dealer has blackjack.')
    .with({ kind: 'Lost', reason: LossReason.LowerHand }, () => 'You lost.')
    .with({ kind: 'Push' }, () => 'Push.')
    .with({ kind: 'Surrendered' }, () => 'Surrender.')
    .exhaustive();

export const handValueToString = (handValue: HandValue) =>
  match(handValue)
    .with({ kind: 'Hard' }, ({ value }) => `hard ${value}`)
    .with({ kind: 'Soft' }, ({ value }) => `soft ${value}`)
    .with({ kind: 'Blackjack' }, () => 'You won!')
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

export const rankToString = (rank: Rank, tenAsNumber?: boolean) =>
  match(rank)
    .with(Rank.Two, () => '2')
    .with(Rank.Three, () => '3')
    .with(Rank.Four, () => '4')
    .with(Rank.Five, () => '5')
    .with(Rank.Six, () => '6')
    .with(Rank.Seven, () => '7')
    .with(Rank.Eight, () => '8')
    .with(Rank.Nine, () => '9')
    .with(Rank.Ten, () => '10')
    .with(Rank.Jack, () => (tenAsNumber ? 10 : 'J'))
    .with(Rank.Queen, () => (tenAsNumber ? 10 : 'Q'))
    .with(Rank.King, () => (tenAsNumber ? 10 : 'K'))
    .with(Rank.Ace, () => 'A')
    .exhaustive();

export const rankToNumber = (rank: Rank) =>
  match(rank)
    .with(Rank.Ace, () => 1)
    .with(Rank.Two, () => 2)
    .with(Rank.Three, () => 3)
    .with(Rank.Four, () => 4)
    .with(Rank.Five, () => 5)
    .with(Rank.Six, () => 6)
    .with(Rank.Seven, () => 7)
    .with(Rank.Eight, () => 8)
    .with(Rank.Nine, () => 9)
    .with(Rank.Ten, () => 10)
    .with(Rank.Jack, () => 10)
    .with(Rank.Queen, () => 10)
    .with(Rank.King, () => 10)
    .exhaustive();

export const hitPdf = (Blackjack: Blackjack, game: BlackjackState) => {
  const playerHandValue = Blackjack.get_player_hand_value(game);
  const playerHandNumber =
    match(playerHandValue)
      .with({ kind: 'Hard' }, ({ value }) => value)
      .with({ kind: 'Soft' }, ({ value }) => value)
      .otherwise(() => undefined) ?? 0;

  let entries: [string | number, number][] = [];
  if (isMatching({ kind: 'Soft' }, playerHandValue)) {
    for (let card = 1; card <= 10; card++) {
      const probability = card === 10 ? 4 / 13 : 1 / 13;
      const withAceAsTen = playerHandNumber + card;
      const withAceAsOne = playerHandNumber + card - 10;
      const key = withAceAsTen < 21 ? `S${withAceAsTen}` : withAceAsOne <= 21 ? withAceAsOne : 'B';
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
      const key = afterHit <= 21 ? afterHit : 'B';
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
  return entries;
};

export const dealerHandPdf = (Blackjack: Blackjack, game: BlackjackState, iterations: number) => {
  const startTime = performance.now();
  const results = Blackjack.simulate_dealer_stand_outcome(rankToNumber(game.dealer_hand[0].rank), iterations);
  const endTime = performance.now();
  const runtimeMs = endTime - startTime;

  const entries = Array.from(results.entries());
  const truncatedEntries: [number | 'B', number][] = entries.filter(([key]) => key <= 21);
  truncatedEntries.push(['B', entries.filter(([key]) => key > 21).reduce((acc, [, value]) => acc + value, 0)]);
  const pdf = truncatedEntries
    .map(([key, value]) => ({
      x: key,
      y: (value / iterations) * 100,
    }))
    .sort((a, b) => (a.x === 'B' ? 1 : b.x === 'B' ? -1 : a.x - b.x));
  return { pdf, runtimeMs };
};
