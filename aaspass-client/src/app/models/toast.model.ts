/** Visual and semantic category of a toast notification. */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** A single toast notification shown by the shared toaster. */
export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  title?: string;
  durationMs: number;
  /** Bumped each time a duplicate restarts the timer, so the countdown bar can restart too. */
  restarts: number;
}
