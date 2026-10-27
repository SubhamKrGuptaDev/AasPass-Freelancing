import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Toast, ToastType } from '../../models/toast.model';
import { ToastService } from '../../services/toast/toast.service';

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
