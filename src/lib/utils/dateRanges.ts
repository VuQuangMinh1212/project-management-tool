import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  format,
  parseISO,
  isWithinInterval,
  isValid,
} from "date-fns";

export type TimeRange = "week" | "month" | "quarter" | "year";

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Get date range for a specific time period
 */
export const getDateRangeForPeriod = (
  period: TimeRange,
  offset = 0
): DateRange => {
  const now = new Date();
  let start: Date;
  let end: Date;
  let label: string;

  switch (period) {
    case "week":
      start = startOfWeek(subWeeks(now, offset));
      end = endOfWeek(subWeeks(now, offset));
      label =
        offset === 0
          ? "This Week"
          : `${offset} Week${offset > 1 ? "s" : ""} Ago`;
      break;
    case "month":
      start = startOfMonth(subMonths(now, offset));
      end = endOfMonth(subMonths(now, offset));
      label =
        offset === 0
          ? "This Month"
          : `${offset} Month${offset > 1 ? "s" : ""} Ago`;
      break;
    case "quarter":
      start = startOfQuarter(subQuarters(now, offset));
      end = endOfQuarter(subQuarters(now, offset));
      label =
        offset === 0
          ? "This Quarter"
          : `${offset} Quarter${offset > 1 ? "s" : ""} Ago`;
      break;
    case "year":
      start = startOfYear(subYears(now, offset));
      end = endOfYear(subYears(now, offset));
      label =
        offset === 0
          ? "This Year"
          : `${offset} Year${offset > 1 ? "s" : ""} Ago`;
      break;
    default:
      start = startOfWeek(now);
      end = endOfWeek(now);
      label = "This Week";
  }

  return { start, end, label };
};

/**
 * Get predefined date range options
 */
export const getDateRangeOptions = (): Array<{
  value: string;
  label: string;
  period: TimeRange;
  offset: number;
}> => [
  { value: "this-week", label: "This Week", period: "week", offset: 0 },
  { value: "last-week", label: "Last Week", period: "week", offset: 1 },
  { value: "this-month", label: "This Month", period: "month", offset: 0 },
  { value: "last-month", label: "Last Month", period: "month", offset: 1 },
  {
    value: "this-quarter",
    label: "This Quarter",
    period: "quarter",
    offset: 0,
  },
  {
    value: "last-quarter",
    label: "Last Quarter",
    period: "quarter",
    offset: 1,
  },
  { value: "this-year", label: "This Year", period: "year", offset: 0 },
  { value: "last-year", label: "Last Year", period: "year", offset: 1 },
];

/**
 * Check if a date is within a date range
 */
export const isDateInRange = (
  date: string | Date,
  dateRange: DateRange
): boolean => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;

    return isWithinInterval(dateObj, {
      start: dateRange.start,
      end: dateRange.end,
    });
  } catch (error) {
    return false;
  }
};

/**
 * Format date range for display
 */
export const formatDateRange = (dateRange: DateRange): string => {
  return `${format(dateRange.start, "MMM dd")} - ${format(
    dateRange.end,
    "MMM dd, yyyy"
  )}`;
};

/**
 * Get custom date range from start and end dates
 */
export const getCustomDateRange = (
  startDate: string,
  endDate: string
): DateRange | null => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (!isValid(start) || !isValid(end)) return null;

    return {
      start,
      end,
      label: `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`,
    };
  } catch (error) {
    return null;
  }
};
