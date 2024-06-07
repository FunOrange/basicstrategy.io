/* tslint:disable */
/* eslint-disable */
/**
* @param {boolean} surrender
* @param {boolean} dealer_stands_on_all_17
* @param {boolean} dealer_peeks
* @param {any} split_aces
* @param {boolean} hit_on_split_ace
* @param {any} max_hands_after_split
* @param {any} double_down_on
* @param {boolean} double_after_split
* @param {boolean} double_on_split_ace
* @param {number} blackjack_payout
* @param {boolean} ace_and_ten_counts_as_blackjack
* @param {boolean} split_ace_can_be_blackjack
* @returns {any}
*/
export function create_ruleset(surrender: boolean, dealer_stands_on_all_17: boolean, dealer_peeks: boolean, split_aces: any, hit_on_split_ace: boolean, max_hands_after_split: any, double_down_on: any, double_after_split: boolean, double_on_split_ace: boolean, blackjack_payout: number, ace_and_ten_counts_as_blackjack: boolean, split_ace_can_be_blackjack: boolean): any;
/**
* @param {number} starting_bet
* @param {any} rules
* @returns {any}
*/
export function init_state(starting_bet: number, rules: any): any;
/**
* @param {any} game
* @param {any} action
* @returns {any}
*/
export function next_state(game: any, action: any): any;
/**
* @param {any} game
* @returns {any}
*/
export function allowed_actions(game: any): any;
/**
* @param {number} iterations
*/
export function monte_carlo(iterations: number): void;
