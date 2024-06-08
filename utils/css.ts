import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Use for merging or conditionally applying classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
