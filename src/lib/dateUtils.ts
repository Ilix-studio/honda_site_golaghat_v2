// src/lib/dateUtils.ts

/**
 * Format a date in a pretty format (e.g., "April 24, 2023")
 * This is a custom implementation to replace date-fns format function
 */
export const formatPrettyDate = (date: Date | undefined): string => {
  if (!date) return "";

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
};

/**
 * Format a date according to specified format
 * Simplified version that supports only basic patterns:
 * - "PPP" = "April 24, 2023"
 * - "PPPP" = "Monday, April 24, 2023"
 * - "MM/dd/yyyy" = "04/24/2023"
 */
export const formatDate = (date: Date | undefined, pattern: string): string => {
  if (!date) return "";

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const shortMonths = months.map((m) => m.substring(0, 3));

  const day = date.getDate();
  const dayOfWeek = days[date.getDay()];
  const month = date.getMonth() + 1; // 1-12
  const monthName = months[date.getMonth()];
  const shortMonthName = shortMonths[date.getMonth()];
  const year = date.getFullYear();

  // Add leading zeros
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const monthStr = month < 10 ? `0${month}` : `${month}`;

  switch (pattern) {
    case "PPP":
      return `${monthName} ${day}, ${year}`;
    case "PPPP":
      return `${dayOfWeek}, ${monthName} ${day}, ${year}`;
    case "MM/dd/yyyy":
      return `${monthStr}/${dayStr}/${year}`;
    case "yyyy-MM-dd":
      return `${year}-${monthStr}-${dayStr}`;
    case "MMM d, yyyy":
      return `${shortMonthName} ${day}, ${year}`;
    default:
      return `${monthName} ${day}, ${year}`;
  }
};
