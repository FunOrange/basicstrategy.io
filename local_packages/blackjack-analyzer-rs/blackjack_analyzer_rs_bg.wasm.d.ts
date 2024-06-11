/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function init_state(a: number, b: number): number;
export function next_state(a: number, b: number): number;
export function get_allowed_actions(a: number): number;
export function get_optimal_move(a: number): number;
export function get_player_hand_value(a: number): number;
export function get_dealer_hand_value(a: number): number;
export function get_game_outcome(a: number): number;
export function monte_carlo(a: number, b: number): void;
export function monte_carlo_dealer_only(a: number, b: number): number;
export function __wbindgen_malloc(a: number, b: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number, d: number): number;
export function __wbindgen_exn_store(a: number): void;
