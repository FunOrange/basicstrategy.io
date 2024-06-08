/* tslint:disable */
/* eslint-disable */
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
* @param {any} game
* @returns {any}
*/
export function game_outcome(game: any): any;
/**
* @param {number} iterations
*/
export function monte_carlo(iterations: number): void;
