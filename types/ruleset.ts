export enum SplitAces {
  NotAllowed = "NotAllowed",
  Once = "Once",
  Twice = "Twice",
  Thrice = "Thrice",
}

export enum MaxHandsAfterSplit {
  One = "One",
  Two = "Two",
  Three = "Three",
  Four = "Four",
}

export enum DoubleDownOn {
  Any = "Any",
  NineTenEleven = "NineTenEleven",
  TenEleven = "TenEleven",
}

export interface BlackjackRuleset {
  surrender: boolean;

  // dealer
  dealer_stands_on_all_17: boolean;
  dealer_peeks: boolean;

  // splitting
  split_aces: SplitAces;
  hit_on_split_ace: boolean;
  max_hands_after_split: MaxHandsAfterSplit;

  // doubling
  double_down_on: DoubleDownOn;
  double_after_split: boolean;
  double_on_split_ace: boolean;

  // blackjack
  blackjack_payout: number;
  ace_and_ten_counts_as_blackjack: boolean;
  split_ace_can_be_blackjack: boolean;
}
