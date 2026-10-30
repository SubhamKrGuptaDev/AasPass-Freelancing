import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SearchSelectComponent, SearchSelectOption } from './search-select';

@Component({
  imports: [SearchSelectComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <app-search-select formControlName="radius" label="Radius" inputId="test-radius" [options]="options" />
    </form>
  `,
})
class RadiusFormHost {
  readonly options: readonly SearchSelectOption[] = [
    { value: 5, label: '5 km radius' },
    { value: 10, label: '10 km radius' },
    { value: 50, label: 'Entire City' },
  ];
  readonly form = new FormGroup({ radius: new FormControl<number>(10, { nonNullable: true }) });
}

function inputOf(fixture: ComponentFixture<unknown>): HTMLInputElement {
  const input = (fixture.nativeElement as HTMLElement).querySelector('input');
  if (!input) {
    throw new Error('select input not rendered');
  }
  return input;
}

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

// jsdom lacks scrollIntoView and ResizeObserver (see location-picker.spec.ts).
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
  it('shows the label of the form value', async () => {
    const fixture = TestBed.createComponent(RadiusFormHost);
    await settle(fixture);
    expect(inputOf(fixture).value).toBe('10 km radius');
  });

  it('lists every option when opened on the current selection', async () => {
    const fixture = TestBed.createComponent(RadiusFormHost);
    await settle(fixture);
    inputOf(fixture).click();
    await settle(fixture);
    expect(optionLabels(fixture)).toEqual(['5 km radius', '10 km radius', 'Entire City']);
  });

  it('filters by typed text and Enter selects the first match as the option value', async () => {
    const fixture = TestBed.createComponent(RadiusFormHost);
    await settle(fixture);
    await type(fixture, 'city');
    expect(optionLabels(fixture)).toEqual(['Entire City']);
    press(fixture, 'Enter');
    await settle(fixture);
    expect(fixture.componentInstance.form.controls.radius.value).toBe(50);
    expect(inputOf(fixture).value).toBe('Entire City');
  });

  it('keeps the selection when the text is cleared and the list closes', async () => {
    const fixture = TestBed.createComponent(RadiusFormHost);
    await settle(fixture);
    await type(fixture, '');
    press(fixture, 'Escape');
    await settle(fixture);
    expect(fixture.componentInstance.form.controls.radius.value).toBe(10);
  });
});
