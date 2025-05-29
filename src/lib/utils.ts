import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates estimated EMI based on principal, interest rate, and term
 */
export function calculateEMI(
  principal: number,
  interestRate: number,
  term: number
): number {
  // Convert annual interest rate to monthly and decimal form
  const ratePerMonth = interestRate / 100 / 12;

  if (principal <= 0 || term <= 0 || ratePerMonth <= 0) {
    return 0;
  }

  // EMI calculation formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const emiValue =
    (principal * ratePerMonth * Math.pow(1 + ratePerMonth, term)) /
    (Math.pow(1 + ratePerMonth, term) - 1);

  return emiValue;
}

/**
 * Safely parses a string to number, returns 0 if invalid
 */
export function safeParseInt(value: string, defaultValue = 0): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Adds days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Checks if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

/**
 * Generates an array of numbers in a specified range
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
