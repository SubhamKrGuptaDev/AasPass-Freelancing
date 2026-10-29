import {
  DestroyRef,
  Directive,
  ElementRef,
  Signal,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { BrnAutocomplete } from '@spartan-ng/brain/autocomplete';
import { filterCities } from './filter-cities';

let nextId = 0;

/**
 * Shared state for the searchable country/city pickers (Spartan autocomplete underneath).
 *
 * - `value` is the committed selection; it changes only when an option is picked or the text is
 *   cleared, never on each keystroke.
 * - `search` is the text in the input. It follows `value` and is reset to it when the panel closes,
 *   so leaving the field without picking restores the last selection.
 * - Options are `filterCities(source, search)` (max 50), recomputed only when either changes.
 * - Works with `[(value)]` and, via the subclass' NG_VALUE_ACCESSOR provider, with forms.
 */
@Directive({
  host: { '(focusout)': 'onFocusOut($event)' },
})
export abstract class LocationPickerBase implements ControlValueAccessor {
  /** Selected place name; `''` when nothing is selected. */
  readonly value = model<string>('');
  /** Visible label text (always rendered as a `<label>`; see `hideLabel`). */
  abstract readonly label: Signal<string>;
  /** Id of the text input, for external `<label for>` / aria references. */
  readonly inputId = input<string>(`app-location-picker-${nextId++}`);
  readonly placeholder = input<string>('');
  /** Keeps the label for screen readers only (e.g. compact navbar placement). */
  readonly hideLabel = input(false, { transform: booleanAttribute });
  /** HTML autofill token for the input (e.g. `country-name`, `address-level2`); `off` by default. */
  readonly autocomplete = input<string>('off');
  /**
   * Enter submits the enclosing form while the suggestion list is closed. Off by default: the
   * autocomplete swallows every Enter, which data-entry forms (signup, profile) rely on.
   */
  readonly submitOnEnter = input(false, { transform: booleanAttribute });

  /** Full list to search in. */
  protected abstract readonly source: Signal<readonly string[]>;

  protected readonly disabled = signal(false);
  protected readonly search = linkedSignal(() => this.value());
  protected readonly options = computed(() => filterCities(this.source(), this.search()));
  protected readonly labelId = computed(() => `${this.inputId()}-label`);

  private readonly brnAutocomplete = viewChild(BrnAutocomplete);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  /** An option was picked since the panel opened, so the closing text must not override it. */
  private pickedWhileOpen = false;
  /** Mirrors the panel state from `stateChanged`, so Enter can tell a pick from a submit. */
  private panelOpen = false;

  constructor() {
    const host: HTMLElement = inject(ElementRef).nativeElement;
    // Capture phase: runs before the autocomplete input, which prevents every Enter and closes the
    // panel synchronously on a pick (so a bubbling listener could not tell a pick from a submit).
    const onKeydown = (event: KeyboardEvent): void => {
      if (!this.submitOnEnter() || event.key !== 'Enter' || event.isComposing || this.panelOpen) {
        return;
      }
      const form = event.target instanceof HTMLInputElement ? event.target.form : null;
      form?.requestSubmit();
    };
    host.addEventListener('keydown', onKeydown, true);
    inject(DestroyRef).onDestroy(() => host.removeEventListener('keydown', onKeydown, true));
  }

  /** Brain value changes: an option was picked, or the text was cleared / Escape reset it. */
  protected onSelect(selected: string | null | undefined): void {
    this.pickedWhileOpen = !!selected;
    this.commit(selected ?? '');
  }

  /** Hook run whenever the suggestion list opens (pointer or keyboard); subclasses may refresh data. */
  protected onListOpen(): void {
    // no-op by default
  }

  /** Opens the suggestion list on pointer interaction (keyboard opens via typing / arrows). */
  protected openList(): void {
    this.onListOpen();
    this.brnAutocomplete()?.open();
  }

  /**
   * The panel started closing (pick, Tab, Escape, outside click): show the committed value again.
   * Uses `stateChanged` rather than `closed`, which only fires after the exit animation.
   * If the text exactly matches one option (browser autofill, or typing a full name and leaving),
   * that canonical option is committed instead, so the field never shows an uncommitted name.
   */
  protected onPanelState(state: string): void {
    this.panelOpen = state === 'open';
    if (state === 'open') {
      this.pickedWhileOpen = false;
      this.onListOpen();
      return;
    }
    if (state !== 'closed') {
      return;
    }
    const typed = this.search().trim().toLowerCase();
    const exact = !this.pickedWhileOpen && typed ? this.source().find((o) => o.toLowerCase() === typed) : undefined;
    this.pickedWhileOpen = false;
    if (exact) {
      this.commit(exact);
    }
    this.search.set(this.value());
  }

  protected onFocusOut(event: FocusEvent): void {
    const host = event.currentTarget instanceof Node ? event.currentTarget : null;
    const next = event.relatedTarget instanceof Node ? event.relatedTarget : null;
    if (!host || !next || !host.contains(next)) {
      this.onTouched();
    }
  }

  /** Sets the value and notifies forms, skipping no-op changes so controls are not dirtied. */
  protected commit(next: string): void {
    if (next === this.value()) {
      this.search.set(next);
      return;
    }
    this.value.set(next);
    this.onChange(next);
  }

  writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
