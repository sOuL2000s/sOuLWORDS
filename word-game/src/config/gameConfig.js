/**
 * @file This file contains global game configuration constants.
 * Using a dedicated config file improves maintainability and makes it easy to adjust
 * game parameters without searching through component logic.
 */

/**
 * The number of dynamic levels to generate for the game.
 * This directly impacts replayability.
 * @type {number}
 */
export const NUMBER_OF_DYNAMIC_LEVELS = 10;

/**
 * The cost in coins to use a hint.
 * @type {number}
 */
export const HINT_COST = 50;

/**
 * Duration for displaying wrong word feedback (milliseconds).
 * @type {number}
 */
export const WRONG_WORD_DURATION = 1500;

/**
 * Delay before transitioning to the next level after completion (milliseconds).
 * @type {number}
 */
export const LEVEL_COMPLETE_DELAY = 2000;

/**
 * Coins awarded per letter in a found word.
 * @type {number}
 */
export const COINS_PER_LETTER = 5;

/**
 * Starting coins for a new game or player.
 * @type {number}
 */
export const DEFAULT_STARTING_COINS = 200;

/**
 * Maximum size for the crossword grid (e.g., a 15x15 grid).
 * This helps prevent excessively large grids from dynamic generation.
 * @type {number}
 */
export const GRID_SIZE_MAX = 15;