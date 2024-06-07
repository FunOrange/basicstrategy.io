import { BlackjackRuleset } from "@/types/ruleset";

export enum Suit {
  Hearts = "Hearts",
  Diamonds = "Diamonds",
  Clubs = "Clubs",
  Spades = "Spades",
}
export enum FaceValue {
  Two = "Two",
  Three = "Three",
  Four = "Four",
  Five = "Five",
  Six = "Six",
  Seven = "Seven",
  Eight = "Eight",
  Nine = "Nine",
  Ten = "Ten",
  Jack = "Jack",
  Queen = "Queen",
  King = "King",
  Ace = "Ace",
}
export interface Card {
  suit: Suit;
  face_value: FaceValue;
  face_down: boolean;
}

export enum GameState {
  Dealing = "Dealing",
  PlayerTurn = "PlayerTurn",
  DealerTurn = "DealerTurn",
  GameOver = "GameOver",
}
export interface BlackjackState {
  starting_bet: number;
  shoe: Card[];
  dealer_hand: Card[];
  player_hands: Card[][];
  hand_index: number;
  bets: number[];
  rules: BlackjackRuleset;
  state: GameState;
}

export enum PlayerAction {
  Hit = "Hit",
  Stand = "Stand",
  DoubleDown = "DoubleDown",
  Split = "Split",
  Surrender = "Surrender",
}

export type HandValue =
  | { kind: "hard"; value: number }
  | { kind: "soft"; value: number }
  | { kind: "blackjack" };

export enum WinReason {
  DealerBust = "DealerBust",
  HigherHand = "HigherHand",
  Blackjack = "Blackjack", // technically redundant but useful for displaying to user
}

export enum LossReason {
  Bust = "Bust",
  LowerHand = "LowerHand",
  DealerBlackjack = "DealerBlackjack", // technically redundant but useful for displaying to user
}

export type HandOutcome =
  | { kind: "Won"; reason: WinReason }
  | { kind: "Lost"; reason: LossReason }
  | { kind: "Push" }
  | { kind: "Surrendered" };
