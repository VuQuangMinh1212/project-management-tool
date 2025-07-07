import {
  format,
  startOfWeek,
  addWeeks,
  parseISO,
  isBefore,
  isAfter,
} from "date-fns";

// Configuration: How many weeks ahead can staff plan tasks
const MAX_WEEKS_AHEAD = 8; // Allow planning up to 8 weeks (2 months) in advance

/**
 * Get the current week in ISO format (YYYY-W##)
 */
export function getCurrentWeek(): string {
  const now = new Date();
  const year = now.getFullYear();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start
  const weekNumber = getWeekNumber(weekStart);
  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

/**
 * Get the next week in ISO format
 */
export function getNextWeek(): string {
  const now = new Date();
  const nextWeek = addWeeks(now, 1);
  const year = nextWeek.getFullYear();
  const weekStart = startOfWeek(nextWeek, { weekStartsOn: 1 });
  const weekNumber = getWeekNumber(weekStart);
  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

/**
 * Check if it's currently allowed to create tasks for the next week
 * Staff can only create tasks before the start of the new week
 */
export function canCreateTasksForNextWeek(): boolean {
  const now = new Date();
  const nextWeekStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
  return isBefore(now, nextWeekStart);
}

/**
 * Check if a task submission period is open for a given week
 */
export function isSubmissionOpen(targetWeek: string): boolean {
  const now = new Date();
  const [year, weekPart] = targetWeek.split("-W");
  const weekNumber = parseInt(weekPart);

  // Calculate the start of the target week
  const targetWeekStart = getWeekStartDate(parseInt(year), weekNumber);

  // Can submit until the start of the target week
  return isBefore(now, targetWeekStart);
}

/**
 * Check if a staff member can still modify tasks for a given week
 */
export function canModifyTasksForWeek(targetWeek: string): boolean {
  return isSubmissionOpen(targetWeek);
}

/**
 * Get week number from date
 */
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Get the start date of a specific week
 */
function getWeekStartDate(year: number, weekNumber: number): Date {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysToAdd = (weekNumber - 1) * 7 - firstDayOfYear.getDay() + 1;
  return new Date(year, 0, 1 + daysToAdd);
}

/**
 * Format week for display
 */
export function formatWeekForDisplay(weekString: string): string {
  const [year, weekPart] = weekString.split("-W");
  const weekNumber = parseInt(weekPart);
  const weekStart = getWeekStartDate(parseInt(year), weekNumber);
  const weekEnd = addWeeks(weekStart, 1);

  return `Week ${weekNumber}, ${year} (${format(weekStart, "MMM d")} - ${format(
    weekEnd,
    "MMM d"
  )})`;
}

/**
 * Get available weeks for task submission
 * Allows planning up to MAX_WEEKS_AHEAD weeks in advance
 */
export function getAvailableWeeksForSubmission(): {
  value: string;
  label: string;
}[] {
  const currentWeek = getCurrentWeek();
  const weeks = [];

  // Only allow current week if submission is still open
  if (canCreateTasksForNextWeek()) {
    weeks.push({
      value: currentWeek,
      label: `Current ${formatWeekForDisplay(currentWeek)}`,
    });
  }

  // Allow planning for the next MAX_WEEKS_AHEAD weeks
  const now = new Date();
  for (let i = 1; i <= MAX_WEEKS_AHEAD; i++) {
    const futureWeek = addWeeks(now, i);
    const year = futureWeek.getFullYear();
    const weekStart = startOfWeek(futureWeek, { weekStartsOn: 1 });
    const weekNumber = getWeekNumber(weekStart);
    const weekString = `${year}-W${weekNumber.toString().padStart(2, "0")}`;

    // Check if submission period is still open for this week
    if (isSubmissionOpen(weekString)) {
      let label;
      if (i === 1) {
        label = `Next ${formatWeekForDisplay(weekString)}`;
      } else if (i <= 4) {
        label = `${formatWeekForDisplay(weekString)} (+${i} weeks)`;
      } else {
        const monthsAhead = Math.ceil(i / 4);
        label = `${formatWeekForDisplay(weekString)} (~${monthsAhead} month${
          monthsAhead > 1 ? "s" : ""
        })`;
      }

      weeks.push({
        value: weekString,
        label: label,
      });
    }
  }

  return weeks;
}
