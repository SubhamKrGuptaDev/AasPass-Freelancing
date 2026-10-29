import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Toast, ToastType } from '../../models/toast.model';
import { ToastService } from '../../services/toast.service';

/** Renders the shared toast stack; mount once in the app shell. */
@Component({
  selector: 'app-toaster',
  imports: [NgTemplateOutlet],
  templateUrl: './toaster.html',
})
export class ToasterComponent {
  readonly toastService = inject(ToastService);

  /** success/info are announced politely. */
  readonly politeToasts = computed(() =>
    this.toastService.toasts().filter((t) => t.type === 'success' || t.type === 'info'),
  );

  /** error/warning are announced assertively. */
  readonly alertToasts = computed(() =>
    this.toastService.toasts().filter((t) => t.type === 'error' || t.type === 'warning'),
  );

  private static readonly STYLES: Record<ToastType, string> = {
    success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    error: 'border-rose-300 bg-rose-50 text-rose-900',
    warning: 'border-amber-300 bg-amber-50 text-amber-900',
    info: 'border-sky-300 bg-sky-50 text-sky-900',
  };

  private static readonly ICONS: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
  };

  private static readonly LABELS: Record<ToastType, string> = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
  };

  /** Active pause reasons per toast id; the timer runs only when a toast has none. */
  private readonly pauseReasons = new Map<number, Set<'hover' | 'focus'>>();

  onPointerEnter(id: number): void {
    this.addReason(id, 'hover');
  }

  onPointerLeave(id: number): void {
    this.removeReason(id, 'hover');
  }

  onFocusIn(id: number): void {
    this.addReason(id, 'focus');
  }

  onFocusOut(id: number, event: FocusEvent): void {
    const host = event.currentTarget as Node | null;
    const next = event.relatedTarget as Node | null;
    if (host && next && host.contains(next)) {
      return; // focus moved between the toast's own children
    }
    this.removeReason(id, 'focus');
  }

  private addReason(id: number, reason: 'hover' | 'focus'): void {
    const reasons = this.pauseReasons.get(id) ?? new Set<'hover' | 'focus'>();
    reasons.add(reason);
    this.pauseReasons.set(id, reasons);
    this.toastService.pause(id);
  }

  private removeReason(id: number, reason: 'hover' | 'focus'): void {
    const reasons = this.pauseReasons.get(id);
    if (!reasons) {
      return;
    }
    reasons.delete(reason);
    if (reasons.size === 0) {
      this.pauseReasons.delete(id);
      this.toastService.resume(id);
    }
  }

  styleFor(toast: Toast): string {
    return ToasterComponent.STYLES[toast.type] ?? ToasterComponent.STYLES.info;
  }

  iconFor(toast: Toast): string {
    return ToasterComponent.ICONS[toast.type] ?? ToasterComponent.ICONS.info;
  }

  labelFor(toast: Toast): string {
    return ToasterComponent.LABELS[toast.type] ?? ToasterComponent.LABELS.info;
  }
}
