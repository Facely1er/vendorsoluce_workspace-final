import { useCallback, useMemo, useState } from 'react';
import type { VendorProgramWorkflowId } from '../lib/vendorProgramWorkflowTypes';

const STORAGE_PREFIX = 'vendor-program-workflow-progress-v1';

type StoredShape = {
  completedStepIds: string[];
};

function storageKey(workflowId: VendorProgramWorkflowId): string {
  return `${STORAGE_PREFIX}:${workflowId}`;
}

function load(workflowId: VendorProgramWorkflowId): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(workflowId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as StoredShape;
    return new Set(parsed.completedStepIds ?? []);
  } catch {
    return new Set();
  }
}

function save(workflowId: VendorProgramWorkflowId, completed: Set<string>): void {
  try {
    const payload: StoredShape = { completedStepIds: [...completed] };
    localStorage.setItem(storageKey(workflowId), JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Local-first step completion for guided program workflows.
 * Replace with Supabase merge when backend program state exists (see docs/VENDOR_PROGRAM_WORKFLOWS_GAPS.md).
 */
export function useVendorProgramWorkflowProgress(workflowId: VendorProgramWorkflowId) {
  const [completed, setCompleted] = useState<Set<string>>(() =>
    typeof window !== 'undefined' ? load(workflowId) : new Set()
  );

  const toggleStep = useCallback(
    (stepId: string) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (next.has(stepId)) next.delete(stepId);
        else next.add(stepId);
        save(workflowId, next);
        return next;
      });
    },
    [workflowId]
  );

  const reset = useCallback(() => {
    const empty = new Set<string>();
    setCompleted(empty);
    save(workflowId, empty);
  }, [workflowId]);

  const completedCount = completed.size;

  return useMemo(
    () => ({ completed, completedCount, toggleStep, reset }),
    [completed, completedCount, reset, toggleStep]
  );
}
