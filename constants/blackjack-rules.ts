import {
  DoubleDownOn,
  MaxHandsAfterSplit,
  SplitAces,
  type BlackjackRuleset,
} from '@/types/blackjack-analyzer-js-bindings';

export const rules: BlackjackRuleset = {
  surrender: true,
  dealer_stands_on_all_17: true,
  dealer_peeks: true,
  split_aces: SplitAces.Twice,
  hit_on_split_ace: false,
  max_hands_after_split: MaxHandsAfterSplit.Three,
  double_down_on: DoubleDownOn.Any,
  double_after_split: true,
  double_on_split_ace: false,
  blackjack_payout: 1.5,
  ace_and_ten_counts_as_blackjack: true,
  split_ace_can_be_blackjack: false,
};
