import { install_debugging_hook } from '@/local_packages/blackjack-analyzer-rs/blackjack_analyzer_rs';
import { BlackjackState, Card, HandOutcome, HandValue, PlayerAction } from '@/types/blackjack-analyzer-rs/blackjack';
import { BlackjackRuleset } from '@/types/blackjack-analyzer-rs/ruleset';

export * from '@/types/blackjack-analyzer-rs/blackjack';
export * from '@/types/blackjack-analyzer-rs/ruleset';

type WasmBindgen = typeof import('@/local_packages/blackjack-analyzer-rs/blackjack_analyzer_rs');
export class BlackjackJsBindings implements WasmBindgen {
  init_state: (starting_bet: number, rules: BlackjackRuleset) => BlackjackState = undefined as any;
  next_state: (game: BlackjackState, action?: PlayerAction) => BlackjackState = undefined as any;
  get_allowed_actions: (game: BlackjackState) => PlayerAction[] = undefined as any;
  get_optimal_move: (game: BlackjackState) => PlayerAction = undefined as any;
  get_player_hand_value: (game: BlackjackState) => HandValue = undefined as any;
  get_dealer_hand_value: (game: BlackjackState) => HandValue = undefined as any;
  get_game_outcome: (game: BlackjackState) => HandOutcome[] = undefined as any;
  monte_carlo: (iterations: number) => void = undefined as any;
  simulate_dealer_stand_outcome: (card: number, iterations: number) => Map<number, number> = undefined as any;

  install_debugging_hook: () => void = undefined as any;

  constructor() {
    throw new Error('This class meant to be used as a type definition only');
  }
}
