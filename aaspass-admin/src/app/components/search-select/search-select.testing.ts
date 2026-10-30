import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SearchSelectComponent } from './search-select';

/** Test helper: the `app-search-select` whose input has this id. */
export function searchSelect(fixture: ComponentFixture<unknown>, inputId: string): SearchSelectComponent {
  const match = fixture.debugElement
    .queryAll(By.directive(SearchSelectComponent))
    .map((de) => de.componentInstance as SearchSelectComponent)
    .find((component) => component.inputId() === inputId);
  if (!match) {
    throw new Error(`app-search-select #${inputId} not rendered`);
  }
  return match;
}

/** Test helper: picks `value` in that select as a user would (emits `selectedChange`). */
export function pickSearchSelect(fixture: ComponentFixture<unknown>, inputId: string, value: string): void {
  searchSelect(fixture, inputId).selected.set(value);
  fixture.detectChanges();
}
