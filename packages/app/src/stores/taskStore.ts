import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { WorkspaceTask, PhaseComment } from '../types/workspace';

interface TaskState {
  tasks: WorkspaceTask[];

  addTask: (task: Omit<WorkspaceTask, 'id' | 'created_date' | 'is_overdue'>) => void;
  updateTask: (id: string, updates: Partial<WorkspaceTask>) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addTaskComment: (task_id: string, comment: Omit<PhaseComment, 'id'>) => void;
  refreshOverdueFlags: () => void;

  getTasksByPhase: (phase_id: string) => WorkspaceTask[];
  getOverdueTasks: () => WorkspaceTask[];
  getOpenTasks: () => WorkspaceTask[];
  getTaskSummary: () => {
    total: number;
    open: number;
    in_progress: number;
    overdue: number;
    completed_this_week: number;
  };
}

function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isOverdue(due_date: string | null, status: WorkspaceTask['status']): boolean {
  if (!due_date || status === 'done') return false;
  return due_date < new Date().toISOString().slice(0, 10);
}

function startOfWeek(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      (set, get) => ({
        tasks: [],

        addTask: (task) =>
          set(
            (state) => ({
              tasks: [
                ...state.tasks,
                {
                  ...task,
                  id: generateId(),
                  created_date: new Date().toISOString(),
                  is_overdue: isOverdue(task.due_date, task.status),
                },
              ],
            }),
            false,
            'taskStore/addTask'
          ),

        updateTask: (id, updates) =>
          set(
            (state) => ({
              tasks: state.tasks.map((t) => {
                if (t.id !== id) return t;
                const merged = { ...t, ...updates };
                return { ...merged, is_overdue: isOverdue(merged.due_date, merged.status) };
              }),
            }),
            false,
            'taskStore/updateTask'
          ),

        completeTask: (id) =>
          set(
            (state) => ({
              tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, status: 'done' as const, is_overdue: false } : t
              ),
            }),
            false,
            'taskStore/completeTask'
          ),

        deleteTask: (id) =>
          set(
            (state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }),
            false,
            'taskStore/deleteTask'
          ),

        addTaskComment: (task_id, comment) =>
          set(
            (state) => ({
              tasks: state.tasks.map((t) =>
                t.id === task_id
                  ? {
                      ...t,
                      comments: [
                        ...t.comments,
                        {
                          ...comment,
                          id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                        },
                      ],
                    }
                  : t
              ),
            }),
            false,
            'taskStore/addTaskComment'
          ),

        refreshOverdueFlags: () =>
          set(
            (state) => ({
              tasks: state.tasks.map((t) => ({
                ...t,
                is_overdue: isOverdue(t.due_date, t.status),
              })),
            }),
            false,
            'taskStore/refreshOverdueFlags'
          ),

        getTasksByPhase: (phase_id) =>
          get().tasks.filter((t) => t.phase_id === phase_id),

        getOverdueTasks: () => get().tasks.filter((t) => t.is_overdue),

        getOpenTasks: () =>
          get().tasks.filter((t) => t.status === 'open' || t.status === 'in_progress'),

        getTaskSummary: () => {
          const tasks = get().tasks;
          const weekStart = startOfWeek();
          return {
            total: tasks.length,
            open: tasks.filter((t) => t.status === 'open').length,
            in_progress: tasks.filter((t) => t.status === 'in_progress').length,
            overdue: tasks.filter((t) => t.is_overdue).length,
            completed_this_week: tasks.filter(
              (t) => t.status === 'done' && t.created_date >= weekStart
            ).length,
          };
        },
      }),
      {
        name: 'vendorsoluce-task-store-v1',
        partialize: (state) => ({ tasks: state.tasks }),
      }
    ),
    { name: 'vendorsoluce-task-store-v1' }
  )
);
