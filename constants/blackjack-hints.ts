import { BlackjackJsBindings, BlackjackState, PlayerAction, Rank } from '@/types/blackjack-analyzer-rs';
import { Pattern, isMatching, match } from 'ts-pattern';

enum Hint {
  Hard8Hit,
  Hard9HitAgainst2,
  Hard9DoubleAgainstBustCard,

  Hard9HitAgainstNonBustCard,
  Hard10DoubleAgainstLesser,
  Hard10HitAgainstEqualOrGreater,
  Hard11AlwaysDouble,
  Hard12HitAgainst2_3,
  Hard12StandAgainst4_5_6,
  Hard13AndUpStandAgainstLowCard, // hope the dealer busts
  Hard12AndUpPlayLikeDealer, // play like the dealer
  Hard15Surrender,
  Hard16Surrender,
  Hard17AndUpAlwaysStand, // player like the dealer

  AlwaysSplitEights,
  AlwaysSplitAces,
}

export const getHint = (Blackjack: BlackjackJsBindings, game: BlackjackState): Hint | undefined => {
  const playerHandValue = Blackjack.get_player_hand_value(game);
  const dealerHandValue = Blackjack.get_dealer_hand_value(game);
  const allowedActions = Blackjack.get_allowed_actions(game);
  const canSplit = allowedActions.includes(PlayerAction.Split);

  if (canSplit) {
    const playerHand = game.player_hands[game.hand_index];
    const pair = [playerHand[0].rank, playerHand[1].rank];
    if (isMatching([Rank.Eight, Rank.Eight], pair)) {
      return Hint.AlwaysSplitEights;
    } else if (isMatching([Rank.Ace, Rank.Ace], pair)) {
      return Hint.AlwaysSplitAces;
    }
  } else {
    // prettier-ignore
    return match([playerHandValue, dealerHandValue])
      .with([{ kind: 'Hard', value: 5 }, Pattern.any], () => Hint.Hard8Hit)
      .with([{ kind: 'Hard', value: 6 }, Pattern.any], () => Hint.Hard8Hit)
      .with([{ kind: 'Hard', value: 7 }, Pattern.any], () => Hint.Hard8Hit)
      .with([{ kind: 'Hard', value: 8 }, Pattern.any], () => Hint.Hard8Hit)
      .with([{ kind: 'Hard', value: 9 }, { kind: 'Hard', value: 2 }], () => Hint.Hard9HitAgainst2)
      .with([{ kind: 'Hard', value: 9 }, { kind: 'Hard', value: 3 }], () => Hint.Hard9DoubleAgainstBustCard)
      .with([{ kind: 'Hard', value: 9 }, { kind: 'Hard', value: 4 }], () => Hint.Hard9DoubleAgainstBustCard)
      .with([{ kind: 'Hard', value: 9 }, { kind: 'Hard', value: 5 }], () => Hint.Hard9DoubleAgainstBustCard)
      .with([{ kind: 'Hard', value: 9 }, { kind: 'Hard', value: 6 }], () => Hint.Hard9DoubleAgainstBustCard)
      .with([{ kind: 'Hard', value: 9 }, { kind: 'Hard', value: 7 }], () => Hint.Hard9HitAgainstNonBustCard)
      .with([{ kind: 'Hard', value: 9 }, { kind: 'Hard', value: 8 }], () => Hint.Hard9HitAgainstNonBustCard)
      .with([{ kind: 'Hard', value: 9 }, { kind: 'Hard', value: 9 }], () => Hint.Hard9HitAgainstNonBustCard)
      .with([{ kind: 'Hard', value: 9 }, { kind: 'Hard', value: 10 }], () => Hint.Hard9HitAgainstNonBustCard)
      .with([{ kind: 'Hard', value: 9 }, { kind: 'Soft', value: 11 }], () => Hint.Hard9HitAgainstNonBustCard)
      .with([{ kind: 'Hard', value: 10 }, { kind: 'Hard', value: 2 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'Hard', value: 10 }, { kind: 'Hard', value: 3 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'Hard', value: 10 }, { kind: 'Hard', value: 4 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'Hard', value: 10 }, { kind: 'Hard', value: 5 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'Hard', value: 10 }, { kind: 'Hard', value: 6 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'Hard', value: 10 }, { kind: 'Hard', value: 7 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'Hard', value: 10 }, { kind: 'Hard', value: 8 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'Hard', value: 10 }, { kind: 'Hard', value: 9 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'Hard', value: 10 }, { kind: 'Hard', value: 10 }], () => Hint.Hard10HitAgainstEqualOrGreater)
      .with([{ kind: 'Hard', value: 10 }, { kind: 'Soft', value: 11 }], () => Hint.Hard10HitAgainstEqualOrGreater)
      .with([{ kind: 'Hard', value: 11 }, Pattern.any], () => Hint.Hard11AlwaysDouble)
      .with([{ kind: 'Hard', value: 12 }, { kind: 'Hard', value: 2 }], () => Hint.Hard12HitAgainst2_3)
      .with([{ kind: 'Hard', value: 12 }, { kind: 'Hard', value: 3 }], () => Hint.Hard12HitAgainst2_3)
      .with([{ kind: 'Hard', value: 12 }, { kind: 'Hard', value: 4 }], () => Hint.Hard12StandAgainst4_5_6)
      .with([{ kind: 'Hard', value: 12 }, { kind: 'Hard', value: 5 }], () => Hint.Hard12StandAgainst4_5_6)
      .with([{ kind: 'Hard', value: 12 }, { kind: 'Hard', value: 6 }], () => Hint.Hard12StandAgainst4_5_6)
      .with([{ kind: 'Hard', value: 12 }, { kind: 'Hard', value: 7 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 12 }, { kind: 'Hard', value: 8 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 12 }, { kind: 'Hard', value: 9 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 12 }, { kind: 'Hard', value: 10 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 12 }, { kind: 'Soft', value: 11 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 13 }, { kind: 'Hard', value: 2 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 13 }, { kind: 'Hard', value: 3 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 13 }, { kind: 'Hard', value: 4 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 13 }, { kind: 'Hard', value: 5 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 13 }, { kind: 'Hard', value: 6 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 13 }, { kind: 'Hard', value: 7 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 13 }, { kind: 'Hard', value: 8 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 13 }, { kind: 'Hard', value: 9 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 13 }, { kind: 'Hard', value: 10 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 13 }, { kind: 'Soft', value: 11 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 14 }, { kind: 'Hard', value: 2 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 14 }, { kind: 'Hard', value: 3 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 14 }, { kind: 'Hard', value: 4 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 14 }, { kind: 'Hard', value: 5 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 14 }, { kind: 'Hard', value: 6 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 14 }, { kind: 'Hard', value: 7 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 14 }, { kind: 'Hard', value: 8 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 14 }, { kind: 'Hard', value: 9 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 14 }, { kind: 'Hard', value: 10 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 14 }, { kind: 'Soft', value: 11 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 15 }, { kind: 'Hard', value: 2 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 15 }, { kind: 'Hard', value: 3 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 15 }, { kind: 'Hard', value: 4 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 15 }, { kind: 'Hard', value: 5 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 15 }, { kind: 'Hard', value: 6 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 15 }, { kind: 'Hard', value: 7 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 15 }, { kind: 'Hard', value: 8 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 15 }, { kind: 'Hard', value: 9 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 15 }, { kind: 'Hard', value: 10 }], () => Hint.Hard15Surrender)
      .with([{ kind: 'Hard', value: 15 }, { kind: 'Soft', value: 11 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 16 }, { kind: 'Hard', value: 2 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 16 }, { kind: 'Hard', value: 3 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 16 }, { kind: 'Hard', value: 4 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 16 }, { kind: 'Hard', value: 5 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 16 }, { kind: 'Hard', value: 6 }], () => Hint.Hard13AndUpStandAgainstLowCard)
      .with([{ kind: 'Hard', value: 16 }, { kind: 'Hard', value: 7 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 16 }, { kind: 'Hard', value: 8 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'Hard', value: 16 }, { kind: 'Hard', value: 9 }], () => Hint.Hard16Surrender)
      .with([{ kind: 'Hard', value: 16 }, { kind: 'Hard', value: 10 }], () => Hint.Hard16Surrender)
      .with([{ kind: 'Hard', value: 16 }, { kind: 'Soft', value: 11 }], () => Hint.Hard16Surrender)
      .with([{ kind: 'Hard', value: 17 }, Pattern.any], () => Hint.Hard17AndUpAlwaysStand)
      .with([{ kind: 'Hard', value: 18 }, Pattern.any], () => Hint.Hard17AndUpAlwaysStand)
      .with([{ kind: 'Hard', value: 19 }, Pattern.any], () => Hint.Hard17AndUpAlwaysStand)
      .with([{ kind: 'Hard', value: 20 }, Pattern.any], () => Hint.Hard17AndUpAlwaysStand)
      .otherwise(() => undefined);
  }
};
export const getHintDetails = (
  hint: Hint | undefined,
): { dealerTooltip: string; playerTooltip: string; hint: string } | undefined => {
  return match(hint)
    .with(Hint.Hard8Hit, () => ({
      dealerTooltip: '',
      playerTooltip: 'When you are below 11 you can hit without fear of busting.',
      hint: 'You should hit.',
    }))
    .with(Hint.Hard9HitAgainst2, () => ({
      dealerTooltip: 'Dealer has a weak hand, but not weak enough to double down on.',
      playerTooltip: 'You have a strong hand.',
      hint: "Don't double down, just should hit.",
    }))
    .with(Hint.Hard9DoubleAgainstBustCard, () => ({
      dealerTooltip: 'Dealer has a weak hand.',
      playerTooltip: 'You have a strong hand.',
      hint: 'You should double.',
    }))
    .with(Hint.Hard9HitAgainstNonBustCard, () => ({
      dealerTooltip: 'Dealer is unlikely to bust with this card.',
      playerTooltip: '',
      hint: 'Assume the dealer is not going to bust. Hit until 17 or bust trying.',
    }))
    .with(Hint.Hard10DoubleAgainstLesser, () => ({
      dealerTooltip: 'Dealer has a weaker hand than yours.',
      playerTooltip: 'You have a very strong hand',
      hint: 'You should double.',
    }))
    .with(Hint.Hard10HitAgainstEqualOrGreater, () => ({
      dealerTooltip: 'Dealer has a strong hand.',
      playerTooltip: `You have a strong hand, but not stronger than the dealer's`,
      hint: `Don't double, just hit.`,
    }))
    .with(Hint.Hard11AlwaysDouble, () => ({
      dealerTooltip: '',
      playerTooltip: 'You have the strongest hand possible.',
      hint: 'Always double down on 11.',
    }))
    .with(Hint.Hard12HitAgainst2_3, () => ({
      dealerTooltip: 'Dealer is somewhat likely to bust, but not very.',
      playerTooltip: `You might bust if you hit`,
      hint: 'You should take the chance and hit.',
    }))
    .with(Hint.Hard12StandAgainst4_5_6, () => ({
      dealerTooltip: 'Dealer is likely to bust.',
      playerTooltip: 'You are likely to bust if you hit.',
      hint: 'Should stand and pray that the dealer busts.',
    }))
    .with(Hint.Hard12AndUpPlayLikeDealer, () => ({
      dealerTooltip: 'Dealer is not likely to bust.',
      playerTooltip: `You're at less than 17.`,
      hint: 'Be aggressive; hit until 17 or bust trying.',
    }))
    .with(Hint.Hard13AndUpStandAgainstLowCard, () => ({
      dealerTooltip: 'Dealer is likely to bust.',
      playerTooltip: 'You are likely to bust if you hit.',
      hint: 'Should stand and pray that the dealer busts.',
    }))
    .with(Hint.Hard15Surrender, () => ({
      dealerTooltip: 'Dealer has one of the strongest hands.',
      playerTooltip: 'This is one of the worst hands.',
      hint: 'You should surrender.',
    }))
    .with(Hint.Hard16Surrender, () => ({
      dealerTooltip: 'Dealer has one of the strongest hands.',
      playerTooltip: 'This is literally the worst hand.',
      hint: 'You should surrender.',
    }))
    .with(Hint.Hard17AndUpAlwaysStand, () => ({
      dealerTooltip: '',
      playerTooltip: '',
      hint: 'You should always stand on a hard 17 or greater.',
    }))
    .with(Hint.AlwaysSplitAces, () => ({
      dealerTooltip: '',
      playerTooltip: '',
      hint: 'ALWAYS SPLIT ACES',
    }))
    .with(Hint.AlwaysSplitEights, () => ({
      dealerTooltip: '',
      playerTooltip: '',
      hint: 'ALWAYS SPLIT 8s',
    }))
    .otherwise(() => undefined);
};
