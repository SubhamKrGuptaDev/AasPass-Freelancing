import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleCheck,
  lucideCircleX,
  lucideInfo,
  lucideTriangleAlert,
  lucideX,
} from '@ng-icons/lucide';
import { Toast, ToastType } from '../../models/toast.model';
import { ToastService } from '../../services/toast/toast.service';

/** Renders the shared toast stack; mount once in the app shell. */
@Component({
  selector: 'app-toaster',
  imports: [NgTemplateOutlet, NgIcon],
  providers: [
    provideIcons({ lucideCircleCheck, lucideCircleX, lucideInfo, lucideTriangleAlert, lucideX }),
  ],
  templateUrl: './toaster.html',
  styleUrl: './toaster.css',
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

  /** Tone classes (icon chip + countdown bar) built only from theme tokens. */
  private static readonly STYLES: Record<ToastType, string> = {
    success: 'toast-tone-primary',
    error: 'toast-tone-destructive',
    warning: 'toast-tone-ink',
    info: 'toast-tone-primary',
  };

  private static readonly ICONS: Record<ToastType, string> = {
    success: 'lucideCircleCheck',
    error: 'lucideCircleX',
    warning: 'lucideTriangleAlert',
    info: 'lucideInfo',
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
