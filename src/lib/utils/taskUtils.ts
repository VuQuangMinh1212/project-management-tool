import { Task, TaskStatus } from "@/types/task";

/**
 * Check if a task is overdue based on its due date
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false;

  const now = new Date();
  const dueDate = new Date(task.dueDate);

  // Task is overdue if it's past the due date and not completed
  return dueDate < now && !isTaskCompleted(task);
}

/**
 * Check if a task is completed (done, finished, or cancelled)
 */
export function isTaskCompleted(task: Task): boolean {
  return [TaskStatus.DONE, TaskStatus.FINISHED, TaskStatus.CANCELLED].includes(
    task.status
  );
}

/**
 * Get the appropriate status for a task, considering if it's overdue
 */
export function getTaskStatus(task: Task): TaskStatus {
  // Don't change status for completed tasks
  if (isTaskCompleted(task)) {
    return task.status;
  }

  // If task is overdue, set to overdue status
  if (isTaskOverdue(task)) {
    return TaskStatus.OVERDUE;
  }

  // Otherwise, return the original status
  return task.status;
}

/**
 * Process a task to automatically set overdue status if needed
 */
export function processTaskStatus(task: Task): Task {
  const newStatus = getTaskStatus(task);

  if (newStatus !== task.status) {
    return {
      ...task,
      status: newStatus,
    };
  }

  return task;
}

/**
 * Process an array of tasks to automatically set overdue status where needed
 */
export function processTasksStatus(tasks: Task[]): Task[] {
  return tasks.map(processTaskStatus);
}
