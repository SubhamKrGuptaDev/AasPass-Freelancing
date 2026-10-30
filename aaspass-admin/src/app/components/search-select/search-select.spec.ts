import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchSelectComponent, SearchSelectOption } from './search-select';

@Component({
  imports: [SearchSelectComponent],
  template: `<app-search-select inputId="test-status" label="Status" [options]="options" [(selected)]="status" (selectedChange)="changes = changes + 1" />`,
})
class StatusHost {
  readonly options: readonly SearchSelectOption[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'blocked', label: 'Blocked' },
  ];
  readonly status = signal('all');
  changes = 0;
}

function inputOf(fixture: ComponentFixture<unknown>): HTMLInputElement {
  const input = (fixture.nativeElement as HTMLElement).querySelector('input');
  if (!input) {
    throw new Error('select input not rendered');
  }
  return input;
}

/** Option labels of the listbox the input currently controls (the panel is portalled to the body). */
function optionLabels(fixture: ComponentFixture<unknown>): string[] {
  const listId = inputOf(fixture).getAttribute('aria-controls');
  const list = listId ? document.getElementById(listId) : null;
  return Array.from(list?.querySelectorAll('[role="option"]') ?? []).map((o) => o.textContent?.trim() ?? '');
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

async function type(fixture: ComponentFixture<unknown>, text: string): Promise<void> {
  const input = inputOf(fixture);
  input.value = text;
  input.dispatchEvent(new Event('input'));
  await settle(fixture);
}

function press(fixture: ComponentFixture<unknown>, key: string): void {
  inputOf(fixture).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

// jsdom lacks scrollIntoView (used when highlighting an option) and ResizeObserver (used by the
// overlay while opening; without it the panel's open/close events are never wired).
beforeAll(() => {
  if (typeof Element.prototype.scrollIntoView !== 'function') {
    Element.prototype.scrollIntoView = () => undefined;
  }
  if (typeof globalThis.ResizeObserver !== 'function') {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }
});

describe('SearchSelectComponent', () => {
  it('shows the label of the selected value', async () => {
    const fixture = TestBed.createComponent(StatusHost);
    await settle(fixture);
    expect(inputOf(fixture).value).toBe('All statuses');
  });

  it('lists every option when opened on the current selection', async () => {
    const fixture = TestBed.createComponent(StatusHost);
    await settle(fixture);
    inputOf(fixture).click();
    await settle(fixture);
    expect(optionLabels(fixture)).toEqual(['All statuses', 'Active', 'Inactive', 'Blocked']);
  });

  it('filters by any part of the label, prefix matches first', async () => {
    const fixture = TestBed.createComponent(StatusHost);
    await settle(fixture);
    await type(fixture, 'act');
    expect(optionLabels(fixture)).toEqual(['Active', 'Inactive']);
  });

  it('Enter selects the first match and emits its value', async () => {
    const fixture = TestBed.createComponent(StatusHost);
    await settle(fixture);
    await type(fixture, 'blo');
    press(fixture, 'Enter');
    await settle(fixture);
    expect(fixture.componentInstance.status()).toBe('blocked');
    expect(fixture.componentInstance.changes).toBe(1);
    expect(inputOf(fixture).value).toBe('Blocked');
  });

  it('Enter right after the last letter picks the current first match, not the stale highlight', async () => {
    const fixture = TestBed.createComponent(StatusHost);
    await settle(fixture);
    await type(fixture, 'act');
    const input = inputOf(fixture);
    // No change detection between the last letter and Enter (fast typing / slow device).
    input.value = 'inact';
    input.dispatchEvent(new Event('input'));
    press(fixture, 'Enter');
    await settle(fixture);
    expect(fixture.componentInstance.status()).toBe('inactive');
  });

  it('keeps the selection when the text is cleared and the list closes', async () => {
    const fixture = TestBed.createComponent(StatusHost);
    await settle(fixture);
    await type(fixture, '');
    press(fixture, 'Escape');
    await settle(fixture);
    expect(fixture.componentInstance.status()).toBe('all');
    expect(fixture.componentInstance.changes).toBe(0);
  });
});
