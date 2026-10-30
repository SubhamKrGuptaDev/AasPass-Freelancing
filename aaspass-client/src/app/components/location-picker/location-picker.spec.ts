import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CityPickerComponent } from './city-picker';
import { CountryPickerComponent } from './country-picker';
import { filterCities } from './filter-cities';

@Component({
  imports: [CountryPickerComponent],
  template: `<app-country-picker [(value)]="country" label="Country" inputId="test-country" />`,
})
class CountrySignalHost {
  readonly country = signal('');
}

@Component({
  imports: [CountryPickerComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <app-country-picker formControlName="country" label="Country" inputId="form-country" />
    </form>
  `,
})
class CountryFormHost {
  readonly form = new FormGroup({ country: new FormControl('') });
}

@Component({
  imports: [CountryPickerComponent],
  template: `
    <form (submit)="$event.preventDefault(); submits = submits + 1">
      <app-country-picker [(value)]="country" [submitOnEnter]="submitOnEnter" label="Country" />
    </form>
  `,
})
class CountrySubmitHost {
  readonly country = signal('');
  submitOnEnter = true;
  submits = 0;
}

@Component({
  imports: [CityPickerComponent],
  template: `<app-city-picker
    [country]="country()"
    [(value)]="city"
    label="City"
    inputId="test-city"
  />`,
})
class CitySignalHost {
  readonly country = signal('India');
  readonly city = signal('');
}

@Component({
  imports: [CityPickerComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <app-city-picker formControlName="city" country="India" label="City" inputId="form-city" />
    </form>
  `,
})
class CityFormHost {
  readonly form = new FormGroup({ city: new FormControl('') });
}

function inputOf(fixture: ComponentFixture<unknown>): HTMLInputElement {
  const input = (fixture.nativeElement as HTMLElement).querySelector('input');
  if (!input) {
    throw new Error('picker input not rendered');
  }
  return input;
}

async function type(fixture: ComponentFixture<unknown>, text: string): Promise<void> {
  const input = inputOf(fixture);
  input.value = text;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  await fixture.whenStable();
}

/** Option labels of the listbox the input currently controls (the panel is portalled to the body). */
function optionLabels(fixture: ComponentFixture<unknown>): string[] {
  const listId = inputOf(fixture).getAttribute('aria-controls');
  const list = listId ? document.getElementById(listId) : null;
  return Array.from(list?.querySelectorAll('[role="option"]') ?? []).map(
    (o) => o.textContent?.trim() ?? '',
  );
}

function option(fixture: ComponentFixture<unknown>, label: string): HTMLElement {
  const listId = inputOf(fixture).getAttribute('aria-controls');
  const list = listId ? document.getElementById(listId) : null;
  const match = Array.from(list?.querySelectorAll<HTMLElement>('[role="option"]') ?? []).find(
    (o) => o.textContent?.trim() === label,
  );
  if (!match) {
    throw new Error(`option ${label} not rendered`);
  }
  return match;
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

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('filterCities', () => {
  it('lists prefix matches before contains matches, case-insensitively', () => {
    expect(filterCities(['Pune', 'Puducherry', 'Kanpur', 'Ahmedabad'], 'pu')).toEqual([
      'Pune',
      'Puducherry',
      'Kanpur',
    ]);
  });

  it('caps the result at the limit', () => {
    const many = Array.from({ length: 20_000 }, (_, i) => `City ${i} a`);
    expect(filterCities(many, 'a')).toHaveLength(50);
    expect(filterCities(many, 'a', 10)).toHaveLength(10);
  });

  it('returns the first entries for an empty or blank term', () => {
    const many = Array.from({ length: 80 }, (_, i) => `C${i}`);
    expect(filterCities(many, '')).toEqual(many.slice(0, 50));
    expect(filterCities(many, '   ')).toEqual(many.slice(0, 50));
  });

  it('trims the term and returns nothing when nothing matches', () => {
    expect(filterCities(['Pune'], '  PUN ')).toEqual(['Pune']);
    expect(filterCities(['Pune'], 'xyz')).toEqual([]);
  });
});

describe('CountryPickerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('filters countries as the user types and sets the value on selection', async () => {
    const fixture = TestBed.createComponent(CountrySignalHost);
    await settle(fixture);

    await type(fixture, 'ind');
    const labels = optionLabels(fixture);
    expect(labels).toContain('India');
    expect(labels).toContain('Indonesia');
    expect(labels.length).toBeLessThanOrEqual(50);
    // typing alone does not change the value
    expect(fixture.componentInstance.country()).toBe('');

    option(fixture, 'India').click();
    await settle(fixture);
    expect(fixture.componentInstance.country()).toBe('India');
    expect(inputOf(fixture).value).toBe('India');
  });

  it('is labelled and exposes combobox semantics', async () => {
    const fixture = TestBed.createComponent(CountrySignalHost);
    await settle(fixture);

    const input = inputOf(fixture);
    expect(input.id).toBe('test-country');
    const label = (fixture.nativeElement as HTMLElement).querySelector(`label[for="${input.id}"]`);
    expect(label?.textContent?.trim()).toBe('Country');
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-expanded')).toBe('false');

    await type(fixture, 'ind');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-controls')).toBeTruthy();
  });

  it('works as a form control', async () => {
    const fixture = TestBed.createComponent(CountryFormHost);
    await settle(fixture);
    const control = fixture.componentInstance.form.controls.country;

    control.setValue('Canada');
    await settle(fixture);
    expect(inputOf(fixture).value).toBe('Canada');

    await type(fixture, 'ind');
    expect(control.value).toBe('Canada');
    option(fixture, 'India').click();
    await settle(fixture);
    expect(control.value).toBe('India');
    expect(control.dirty).toBe(true);

    control.disable();
    await settle(fixture);
    expect(inputOf(fixture).disabled).toBe(true);
  });

  it('commits an exactly typed name (any case) when the list closes, but not a partial one', async () => {
    const fixture = TestBed.createComponent(CountrySignalHost);
    await settle(fixture);

    await type(fixture, 'ind');
    inputOf(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await settle(fixture);
    expect(fixture.componentInstance.country()).toBe('');
    expect(inputOf(fixture).value).toBe('');

    await type(fixture, ' india ');
    inputOf(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await settle(fixture);
    expect(fixture.componentInstance.country()).toBe('India');
    expect(inputOf(fixture).value).toBe('India');
  });

  it('puts the autofill hint on the input, defaulting to off', async () => {
    const fixture = TestBed.createComponent(CountrySignalHost);
    await settle(fixture);
    expect(inputOf(fixture).getAttribute('autocomplete')).toBe('off');
  });

  it('with submitOnEnter, Enter picks while the list is open and submits the form once it is closed', async () => {
    const fixture = TestBed.createComponent(CountrySubmitHost);
    await settle(fixture);
    const enter = (): void => {
      inputOf(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    };

    await type(fixture, 'india');
    enter();
    await settle(fixture);
    expect(fixture.componentInstance.country()).toBe('India');
    expect(fixture.componentInstance.submits).toBe(0);

    enter();
    await settle(fixture);
    expect(fixture.componentInstance.submits).toBe(1);
  });

  it('without submitOnEnter, Enter never submits the form', async () => {
    const fixture = TestBed.createComponent(CountrySubmitHost);
    fixture.componentInstance.submitOnEnter = false;
    await settle(fixture);

    inputOf(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await settle(fixture);
    expect(fixture.componentInstance.submits).toBe(0);
  });
});

describe('CityPickerComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists prefix matches of the selected country first', async () => {
    const fixture = TestBed.createComponent(CitySignalHost);
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush(['Kanpur', 'Ahmedabad', 'Pune', 'Puducherry']);
    await settle(fixture);

    await type(fixture, 'pun');
    expect(optionLabels(fixture)[0]).toBe('Pune');

    option(fixture, 'Pune').click();
    await settle(fixture);
    expect(fixture.componentInstance.city()).toBe('Pune');
  });

  it('selects the highlighted first match with Enter', async () => {
    const fixture = TestBed.createComponent(CitySignalHost);
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush(['Kanpur', 'Pune']);
    await settle(fixture);

    await type(fixture, 'pu');
    const input = inputOf(fixture);
    expect(input.getAttribute('aria-activedescendant')).toBe(option(fixture, 'Pune').id);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle(fixture);
    expect(fixture.componentInstance.city()).toBe('Pune');
  });

  it('Enter right after the last letter picks the current first match, not the stale highlight', async () => {
    const fixture = TestBed.createComponent(CitySignalHost);
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush(['Punalūr', 'Pune']);
    await settle(fixture);

    await type(fixture, 'pun');
    const input = inputOf(fixture);
    expect(input.getAttribute('aria-activedescendant')).toBe(option(fixture, 'Punalūr').id);
    // No change detection between the last letter and Enter (fast typing / slow device).
    input.value = 'pune';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await settle(fixture);
    expect(fixture.componentInstance.city()).toBe('Pune');
  });

  it('restores the selected city when the list closes without a pick', async () => {
    const fixture = TestBed.createComponent(CitySignalHost);
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush(['Kanpur', 'Pune']);
    fixture.componentInstance.city.set('Pune');
    await settle(fixture);

    await type(fixture, 'kan');
    const input = inputOf(fixture);
    expect(input.value).toBe('kan');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    // restored as soon as the panel starts closing, not only after its exit animation
    fixture.detectChanges();
    expect(input.value).toBe('Pune');
    await settle(fixture);
    expect(fixture.componentInstance.city()).toBe('Pune');
    expect(input.value).toBe('Pune');
  });

  it('clears the value when the new country lacks the city, only after its list loads', async () => {
    const fixture = TestBed.createComponent(CitySignalHost);
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush(['Pune', 'Mumbai']);
    fixture.componentInstance.city.set('Pune');
    await settle(fixture);

    fixture.componentInstance.country.set('Canada');
    await settle(fixture);
    // still loading: keep the value
    expect(fixture.componentInstance.city()).toBe('Pune');

    http.expectOne('geo/cities/CA.json').flush(['Toronto', 'Vancouver']);
    await settle(fixture);
    expect(fixture.componentInstance.city()).toBe('');
    expect(inputOf(fixture).value).toBe('');
  });

  it('keeps the value when the new country contains it (case-insensitive)', async () => {
    const fixture = TestBed.createComponent(CitySignalHost);
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush(['Hyderabad']);
    fixture.componentInstance.city.set('Hyderabad');
    await settle(fixture);

    fixture.componentInstance.country.set('Pakistan');
    await settle(fixture);
    http.expectOne('geo/cities/PK.json').flush(['Karachi', 'HYDERABAD']);
    await settle(fixture);
    expect(fixture.componentInstance.city()).toBe('Hyderabad');
  });

  it('keeps the value and renders no options when the city file fails', async () => {
    const fixture = TestBed.createComponent(CitySignalHost);
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush(['Pune']);
    fixture.componentInstance.city.set('Pune');
    await settle(fixture);

    fixture.componentInstance.country.set('Nepal');
    await settle(fixture);
    http.expectOne('geo/cities/NP.json').flush('nope', { status: 500, statusText: 'Server Error' });
    await settle(fixture);
    expect(fixture.componentInstance.city()).toBe('Pune');
    expect(inputOf(fixture).value).toBe('Pune');

    await type(fixture, 'p');
    // opening the list retries the failed load; it fails again here
    http.expectOne('geo/cities/NP.json').flush('nope', { status: 500, statusText: 'Server Error' });
    await settle(fixture);
    expect(optionLabels(fixture)).toEqual([]);
  });

  it('reconciles against the new country when the country passes through empty', async () => {
    const fixture = TestBed.createComponent(CitySignalHost);
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush(['Pune']);
    fixture.componentInstance.city.set('Pune');
    await settle(fixture);

    fixture.componentInstance.country.set('');
    await settle(fixture);
    expect(fixture.componentInstance.city()).toBe('Pune');

    fixture.componentInstance.country.set('Canada');
    await settle(fixture);
    http.expectOne('geo/cities/CA.json').flush(['Toronto']);
    await settle(fixture);
    expect(fixture.componentInstance.city()).toBe('');
  });

  it('keeps the value when the country returns to the same one through empty', async () => {
    const fixture = TestBed.createComponent(CitySignalHost);
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush(['Pune']);
    fixture.componentInstance.city.set('Pune');
    await settle(fixture);

    fixture.componentInstance.country.set('');
    await settle(fixture);
    fixture.componentInstance.country.set('India');
    await settle(fixture);
    expect(fixture.componentInstance.city()).toBe('Pune');
  });

  it('reconciles a change made before the first list loaded', async () => {
    const fixture = TestBed.createComponent(CitySignalHost);
    fixture.componentInstance.city.set('Pune');
    await settle(fixture);
    const india = http.expectOne('geo/cities/IN.json');

    fixture.componentInstance.country.set('Canada');
    await settle(fixture);
    http.expectOne('geo/cities/CA.json').flush(['Toronto']);
    await settle(fixture);
    expect(fixture.componentInstance.city()).toBe('');
    india.flush(['Pune']);
  });

  it('works as a form control', async () => {
    const fixture = TestBed.createComponent(CityFormHost);
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush(['Kanpur', 'Pune']);
    const control = fixture.componentInstance.form.controls.city;

    control.setValue('Pune');
    await settle(fixture);
    expect(inputOf(fixture).value).toBe('Pune');

    await type(fixture, 'kan');
    expect(control.value).toBe('Pune');
    expect(control.dirty).toBe(false);

    option(fixture, 'Kanpur').click();
    await settle(fixture);
    expect(control.value).toBe('Kanpur');
    expect(control.dirty).toBe(true);
  });

  it('is labelled and exposes combobox semantics', async () => {
    const fixture = TestBed.createComponent(CitySignalHost);
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush([]);

    const input = inputOf(fixture);
    const label = (fixture.nativeElement as HTMLElement).querySelector(`label[for="${input.id}"]`);
    expect(label?.textContent?.trim()).toBe('City');
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.hasAttribute('aria-expanded')).toBe(true);
  });

  it('retries a failed city list when the list is opened, and commits an exact name', async () => {
    const fixture = TestBed.createComponent(CitySignalHost);
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush('nope', { status: 500, statusText: 'Server Error' });
    await settle(fixture);

    inputOf(fixture).click();
    await settle(fixture);
    http.expectOne('geo/cities/IN.json').flush(['Kanpur', 'Pune']);
    await settle(fixture);

    await type(fixture, 'pune');
    inputOf(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await settle(fixture);
    expect(fixture.componentInstance.city()).toBe('Pune');
    expect(inputOf(fixture).value).toBe('Pune');
  });
});
