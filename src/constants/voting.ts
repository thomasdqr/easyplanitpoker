export const FIBONACCI_NUMBERS = [1, 2, 3, 5, 8, 13, 21] as const;
export const VOTING_VALUES = [...FIBONACCI_NUMBERS, '?'] as const;

// Define types for our constants
export type FibonacciNumber = typeof FIBONACCI_NUMBERS[number];
export type VotingValue = typeof VOTING_VALUES[number]; 