import {
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrnAutocomplete } from '@spartan-ng/brain/autocomplete';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
import { filterCities } from '../location-picker/filter-cities';
import { pickFirstMatchOnStaleEnter } from '../location-picker/pick-first-match';

/** One choice of a `SearchSelectComponent`: the value it selects and the text shown / searched. */
export interface SearchSelectOption {
  readonly value: string | number;
  readonly label: string;
}

let nextId = 0;

/**
 * Searchable replacement for a native `<select>`: type any part of a label to filter (labels
 * starting with the text first), Enter picks the first (highlighted) match, arrows move, Escape or
 * leaving the field restores the current selection.
 *
 * `<app-search-select label="Sort by" [options]="opts" [(selected)]="sort" />` or with
 * `formControlName` (the control holds the option's `value`). Labels must be unique.
 */
@Component({
  selector: 'app-search-select',
  imports: [HlmAutocompleteImports],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SearchSelectComponent), multi: true },
  ],
  host: { class: 'block', '(focusout)': 'onFocusOut($event)' },
  templateUrl: './search-select.html',
})
export class SearchSelectComponent implements ControlValueAccessor {
  readonly options = input.required<readonly SearchSelectOption[]>();
  /** Value of the selected option; emits `selectedChange` only when the user picks a different one. */
  readonly selected = model<string | number | null>(null);
  /** Visible label text (always rendered as a `<label>`; see `hideLabel`). */
  readonly label = input.required<string>();
  /** Id of the text input, for external `<label for>` / aria references. */
  readonly inputId = input<string>(`app-search-select-${nextId++}`);
  readonly placeholder = input<string>('');
  readonly emptyText = input<string>('No matches found.');
  /** Keeps the label for screen readers only (compact toolbars). */
  readonly hideLabel = input(false, { transform: booleanAttribute });
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  private readonly formDisabled = signal(false);
  protected readonly disabled = computed(() => this.disabledInput() || this.formDisabled());
  protected readonly labelId = computed(() => `${this.inputId()}-label`);
  protected readonly selectedLabel = computed(
    () => this.options().find((option) => option.value === this.selected())?.label ?? '',
  );
  /** Text in the input; follows the selection and is reset to it when the list closes. */
  protected readonly search = linkedSignal(() => this.selectedLabel());
  /** Full list while the text is still the selection (like a native select), else filtered. */
  protected readonly matches = computed(() => {
    const term = this.search();
    const labels = this.options().map((option) => option.label);
    return filterCities(labels, term === this.selectedLabel() ? '' : term);
  });

  private readonly brnAutocomplete = viewChild<BrnAutocomplete<string>>(BrnAutocomplete);
  private onChange: (value: string | number) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  /** An option was picked since the list opened, so the closing text must not override it. */
  private pickedWhileOpen = false;

  constructor() {
    const host: HTMLElement = inject(ElementRef).nativeElement;
    // Capture phase: must run before the autocomplete input's own Enter handler.
    const onKeydown = (event: KeyboardEvent): void => {
      pickFirstMatchOnStaleEnter(event, this.brnAutocomplete(), this.search(), this.matches());
    };
    host.addEventListener('keydown', onKeydown, true);
    inject(DestroyRef).onDestroy(() => host.removeEventListener('keydown', onKeydown, true));
  }

  /** Brain value changes: an option was picked (clearing the text never empties the selection). */
  protected onSelect(label: string | null | undefined): void {
    if (!label) {
      return;
    }
    this.pickedWhileOpen = true;
    this.pick(label);
  }

  /** Opens the list on pointer interaction (keyboard opens via typing / arrows). */
  protected openList(): void {
    this.brnAutocomplete()?.open();
  }

  /**
   * The list started closing (pick, Tab, Escape, outside click): show the selection again. If the
   * typed text exactly matches one label, that option is picked instead.
   */
  protected onPanelState(state: string): void {
    if (state === 'open') {
      this.pickedWhileOpen = false;
      return;
    }
    if (state !== 'closed') {
      return;
    }
    const typed = this.search().trim().toLowerCase();
    const exact =
      !this.pickedWhileOpen && typed
        ? this.options().find((option) => option.label.toLowerCase() === typed)
        : undefined;
    this.pickedWhileOpen = false;
    if (exact) {
      this.pick(exact.label);
    }
    this.search.set(this.selectedLabel());
  }

  protected onFocusOut(event: FocusEvent): void {
    const host = event.currentTarget instanceof Node ? event.currentTarget : null;
    const next = event.relatedTarget instanceof Node ? event.relatedTarget : null;
    if (!host || !next || !host.contains(next)) {
      this.onTouched();
    }
  }

  /** Selects the option with this label and notifies listeners, skipping no-op changes. */
  private pick(label: string): void {
    const option = this.options().find((o) => o.label === label);
    if (option && option.value !== this.selected()) {
      this.selected.set(option.value);
      this.onChange(option.value);
    }
    this.search.set(this.selectedLabel());
  }

  writeValue(value: unknown): void {
    this.selected.set(typeof value === 'string' || typeof value === 'number' ? value : null);
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
