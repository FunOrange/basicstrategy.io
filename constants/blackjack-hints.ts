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
  Hard13AndUpStandAgainstBustCard, // hope the dealer busts
  Hard12AndUpPlayLikeDealer, // play like the dealer
  Hard15Surrender,
  Hard16Surrender,
  Hard17AndUpAlwaysStand, // player like the dealer

  AlwaysSplitAcesAndEights,
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
      return Hint.AlwaysSplitAcesAndEights;
    } else if (isMatching([Rank.Ace, Rank.Ace], pair)) {
      return Hint.AlwaysSplitAcesAndEights;
    }
  } else {
    // prettier-ignore
    return match([playerHandValue, dealerHandValue])
      .with([{ kind: 'hard', value: 5 }, Pattern.any], () => Hint.Hard8Hit)
      .with([{ kind: 'hard', value: 6 }, Pattern.any], () => Hint.Hard8Hit)
      .with([{ kind: 'hard', value: 7 }, Pattern.any], () => Hint.Hard8Hit)
      .with([{ kind: 'hard', value: 8 }, Pattern.any], () => Hint.Hard8Hit)
      .with([{ kind: 'hard', value: 9 }, { kind: 'hard', value: 2 }], () => Hint.Hard9HitAgainst2)
      .with([{ kind: 'hard', value: 9 }, { kind: 'hard', value: 3 }], () => Hint.Hard9DoubleAgainstBustCard)
      .with([{ kind: 'hard', value: 9 }, { kind: 'hard', value: 4 }], () => Hint.Hard9DoubleAgainstBustCard)
      .with([{ kind: 'hard', value: 9 }, { kind: 'hard', value: 5 }], () => Hint.Hard9DoubleAgainstBustCard)
      .with([{ kind: 'hard', value: 9 }, { kind: 'hard', value: 6 }], () => Hint.Hard9DoubleAgainstBustCard)
      .with([{ kind: 'hard', value: 9 }, { kind: 'hard', value: 7 }], () => Hint.Hard9HitAgainstNonBustCard)
      .with([{ kind: 'hard', value: 9 }, { kind: 'hard', value: 8 }], () => Hint.Hard9HitAgainstNonBustCard)
      .with([{ kind: 'hard', value: 9 }, { kind: 'hard', value: 9 }], () => Hint.Hard9HitAgainstNonBustCard)
      .with([{ kind: 'hard', value: 9 }, { kind: 'hard', value: 10 }], () => Hint.Hard9HitAgainstNonBustCard)
      .with([{ kind: 'hard', value: 9 }, { kind: 'soft', value: 11 }], () => Hint.Hard9HitAgainstNonBustCard)
      .with([{ kind: 'hard', value: 10 }, { kind: 'hard', value: 2 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'hard', value: 10 }, { kind: 'hard', value: 3 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'hard', value: 10 }, { kind: 'hard', value: 4 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'hard', value: 10 }, { kind: 'hard', value: 5 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'hard', value: 10 }, { kind: 'hard', value: 6 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'hard', value: 10 }, { kind: 'hard', value: 7 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'hard', value: 10 }, { kind: 'hard', value: 8 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'hard', value: 10 }, { kind: 'hard', value: 9 }], () => Hint.Hard10DoubleAgainstLesser)
      .with([{ kind: 'hard', value: 10 }, { kind: 'hard', value: 10 }], () => Hint.Hard10HitAgainstEqualOrGreater)
      .with([{ kind: 'hard', value: 10 }, { kind: 'soft', value: 11 }], () => Hint.Hard10HitAgainstEqualOrGreater)
      .with([{ kind: 'hard', value: 11 }, Pattern.any], () => Hint.Hard11AlwaysDouble)
      .with([{ kind: 'hard', value: 12 }, { kind: 'hard', value: 2 }], () => Hint.Hard12HitAgainst2_3)
      .with([{ kind: 'hard', value: 12 }, { kind: 'hard', value: 3 }], () => Hint.Hard12HitAgainst2_3)
      .with([{ kind: 'hard', value: 12 }, { kind: 'hard', value: 4 }], () => Hint.Hard12StandAgainst4_5_6)
      .with([{ kind: 'hard', value: 12 }, { kind: 'hard', value: 5 }], () => Hint.Hard12StandAgainst4_5_6)
      .with([{ kind: 'hard', value: 12 }, { kind: 'hard', value: 6 }], () => Hint.Hard12StandAgainst4_5_6)
      .with([{ kind: 'hard', value: 12 }, { kind: 'hard', value: 7 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 12 }, { kind: 'hard', value: 8 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 12 }, { kind: 'hard', value: 9 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 12 }, { kind: 'hard', value: 10 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 12 }, { kind: 'soft', value: 11 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 13 }, { kind: 'hard', value: 2 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 13 }, { kind: 'hard', value: 3 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 13 }, { kind: 'hard', value: 4 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 13 }, { kind: 'hard', value: 5 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 13 }, { kind: 'hard', value: 6 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 13 }, { kind: 'hard', value: 7 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 13 }, { kind: 'hard', value: 8 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 13 }, { kind: 'hard', value: 9 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 13 }, { kind: 'hard', value: 10 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 13 }, { kind: 'soft', value: 11 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 14 }, { kind: 'hard', value: 2 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 14 }, { kind: 'hard', value: 3 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 14 }, { kind: 'hard', value: 4 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 14 }, { kind: 'hard', value: 5 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 14 }, { kind: 'hard', value: 6 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 14 }, { kind: 'hard', value: 7 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 14 }, { kind: 'hard', value: 8 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 14 }, { kind: 'hard', value: 9 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 14 }, { kind: 'hard', value: 10 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 14 }, { kind: 'soft', value: 11 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 15 }, { kind: 'hard', value: 2 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 15 }, { kind: 'hard', value: 3 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 15 }, { kind: 'hard', value: 4 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 15 }, { kind: 'hard', value: 5 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 15 }, { kind: 'hard', value: 6 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 15 }, { kind: 'hard', value: 7 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 15 }, { kind: 'hard', value: 8 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 15 }, { kind: 'hard', value: 9 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 15 }, { kind: 'hard', value: 10 }], () => Hint.Hard15Surrender)
      .with([{ kind: 'hard', value: 15 }, { kind: 'soft', value: 11 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 16 }, { kind: 'hard', value: 2 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 16 }, { kind: 'hard', value: 3 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 16 }, { kind: 'hard', value: 4 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 16 }, { kind: 'hard', value: 5 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 16 }, { kind: 'hard', value: 6 }], () => Hint.Hard13AndUpStandAgainstBustCard)
      .with([{ kind: 'hard', value: 16 }, { kind: 'hard', value: 7 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 16 }, { kind: 'hard', value: 8 }], () => Hint.Hard12AndUpPlayLikeDealer)
      .with([{ kind: 'hard', value: 16 }, { kind: 'hard', value: 9 }], () => Hint.Hard16Surrender)
      .with([{ kind: 'hard', value: 16 }, { kind: 'hard', value: 10 }], () => Hint.Hard16Surrender)
      .with([{ kind: 'hard', value: 16 }, { kind: 'soft', value: 11 }], () => Hint.Hard16Surrender)
      .with([{ kind: 'hard', value: 17 }, Pattern.any], () => Hint.Hard17AndUpAlwaysStand)
      .with([{ kind: 'hard', value: 18 }, Pattern.any], () => Hint.Hard17AndUpAlwaysStand)
      .with([{ kind: 'hard', value: 19 }, Pattern.any], () => Hint.Hard17AndUpAlwaysStand)
      .with([{ kind: 'hard', value: 20 }, Pattern.any], () => Hint.Hard17AndUpAlwaysStand)
      .otherwise(() => undefined);
  }
};
