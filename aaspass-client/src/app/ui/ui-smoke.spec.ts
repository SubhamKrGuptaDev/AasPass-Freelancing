import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-ui-smoke-host',
  imports: [HlmButtonImports, HlmCardImports, HlmBadgeImports, HlmInputImports],
  template: `
    <section hlmCard>
      <button hlmBtn type="button">Go</button>
      <span hlmBadge>Verified</span>
      <input hlmInput placeholder="Search" />
    </section>
  `,
})
class UiSmokeHost {}

describe('Spartan UI smoke', () => {
  it('renders helm button, card, badge and input', async () => {
    const fixture = TestBed.createComponent(UiSmokeHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const button = root.querySelector('button');
    expect(button?.getAttribute('class') ?? '').toContain('inline-flex');
    expect(root.querySelector('[hlmBadge]')?.textContent).toContain('Verified');
    expect(root.querySelector('[hlmCard]')?.getAttribute('class') ?? '').not.toBe('');
    expect(root.querySelector('input')?.getAttribute('class') ?? '').not.toBe('');
  });
});
