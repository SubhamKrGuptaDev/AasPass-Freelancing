import { Service, signal } from '@angular/core';
import { Toast, ToastType } from '../models/toast.model';

const MAX_TOASTS = 4;
const SHORT_DURATION_MS = 4000;
const LONG_DURATION_MS = 6000;

interface TimerState {
  handle: ReturnType<typeof setTimeout> | null;
  remainingMs: number;
  startedAt: number;
}

/**
 * Singleton, signal-based toast store. Success/info toasts last 4s, warning/error 6s;
 * at most 4 are visible (oldest dropped) and an identical type+message restarts its timer
 * instead of being duplicated. Pausing keeps the remaining time; resuming continues from it.
 */
@Service()
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private readonly timers = new Map<number, TimerState>();
  private nextId = 1;

  success(message: string, title?: string): void {
    this.show('success', message, title);
  }

  error(message: string, title?: string): void {
    this.show('error', message, title);
  }

  warning(message: string, title?: string): void {
    this.show('warning', message, title);
  }

  info(message: string, title?: string): void {
    this.show('info', message, title);
  }

  show(type: ToastType, message: string, title?: string): void {
    const existing = this._toasts().find((t) => t.type === type && t.message === message);
    if (existing) {
      const state = this.timers.get(existing.id);
      if (state && state.handle === null) {
        // Paused (hovered/focused): refill the time but stay paused until resume().
        state.remainingMs = existing.durationMs;
      } else {
        this.startTimer(existing.id, existing.durationMs);
      }
      return;
    }

    const toast: Toast = {
      id: this.nextId++,
      type,
      message,
      title,
      durationMs: type === 'warning' || type === 'error' ? LONG_DURATION_MS : SHORT_DURATION_MS,
    };

    const next = [...this._toasts(), toast];
    const overflow = Math.max(0, next.length - MAX_TOASTS);
    next.slice(0, overflow).forEach((t) => this.clearTimer(t.id));
    this._toasts.set(next.slice(overflow));
    this.startTimer(toast.id, toast.durationMs);
  }

  dismiss(id: number): void {
    this.clearTimer(id);
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    Array.from(this.timers.keys()).forEach((id) => this.clearTimer(id));
    this._toasts.set([]);
  }

  /** Stops the auto-dismiss countdown, remembering the time left. */
  pause(id: number): void {
    const state = this.timers.get(id);
    if (!state || state.handle === null) {
      return;
    }
    clearTimeout(state.handle);
    state.handle = null;
    state.remainingMs = Math.max(0, state.remainingMs - (Date.now() - state.startedAt));
  }

  /** Continues the countdown from the time that was left when paused. */
  resume(id: number): void {
    const state = this.timers.get(id);
    if (!state || state.handle !== null) {
      return;
    }
    this.startTimer(id, state.remainingMs);
  }

  private startTimer(id: number, ms: number): void {
    this.clearTimer(id);
    const handle = setTimeout(() => this.dismiss(id), ms);
    this.timers.set(id, { handle, remainingMs: ms, startedAt: Date.now() });
  }

  private clearTimer(id: number): void {
    const state = this.timers.get(id);
    if (state?.handle != null) {
      clearTimeout(state.handle);
    }
    this.timers.delete(id);
  }
}
