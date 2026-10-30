import {
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  viewChild,
} from '@angular/core';
import { BrnAutocomplete } from '@spartan-ng/brain/autocomplete';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
import { pickFirstMatchOnStaleEnter } from './pick-first-match';

/** One choice of a `SearchSelectComponent`: the value it selects and the text shown / searched. */
export interface SearchSelectOption {
  readonly value: string;
  readonly label: string;
}

/** Most options rendered at once; typing narrows long lists (e.g. cities) further. */
const MAX_MATCHES = 50;

let nextId = 0;

/**
 * Searchable replacement for a native `<select>`: type any part of a label to filter (labels
 * starting with the text first), Enter picks the first (highlighted) match, arrows move, Escape or
 * leaving the field restores the current selection.
 *
 * `<app-search-select label="Status" [options]="opts" [selected]="status()" (selectedChange)="onStatus($event)" />`
 *
 * Labels must be unique within `options`.
 */
@Component({
  selector: 'app-search-select',
  imports: [HlmAutocompleteImports],
  host: { class: 'block' },
  templateUrl: './search-select.html',
})
export class SearchSelectComponent {
  readonly options = input.required<readonly SearchSelectOption[]>();
  /** Value of the selected option; emits `selectedChange` only when the user picks a different one. */
  readonly selected = model<string>('');
  /** Visible label text (always rendered as a `<label>`). */
  readonly label = input.required<string>();
  /** Id of the text input, for external `<label for>` / test references. */
  readonly inputId = input<string>(`app-search-select-${nextId++}`);
  readonly placeholder = input<string>('');
  readonly emptyText = input<string>('No matches found.');
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly labelId = computed(() => `${this.inputId()}-label`);
  protected readonly selectedLabel = computed(
    () => this.options().find((option) => option.value === this.selected())?.label ?? '',
  );
  /** Text in the input; follows the selection and is reset to it when the list closes. */
  protected readonly search = linkedSignal(() => this.selectedLabel());
  /** Full list while the text is still the selection (like a native select), else filtered. */
  protected readonly matches = computed(() => {
    const labels = this.options().map((option) => option.label);
    const term = this.search().trim().toLowerCase();
    if (!term || this.search() === this.selectedLabel()) {
      return labels.slice(0, MAX_MATCHES);
    }
    const prefix: string[] = [];
    const contains: string[] = [];
    for (const label of labels) {
      const index = label.toLowerCase().indexOf(term);
      if (index === 0) {
        prefix.push(label);
      } else if (index > 0) {
        contains.push(label);
      }
    }
    return prefix.concat(contains).slice(0, MAX_MATCHES);
  });

  private readonly brnAutocomplete = viewChild<BrnAutocomplete<string>>(BrnAutocomplete);
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

  private pick(label: string): void {
    const option = this.options().find((o) => o.label === label);
    if (option && option.value !== this.selected()) {
      this.selected.set(option.value);
    }
    this.search.set(this.selectedLabel());
  }
}
