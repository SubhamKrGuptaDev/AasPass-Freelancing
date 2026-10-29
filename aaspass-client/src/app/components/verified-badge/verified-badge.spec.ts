import { TestBed } from '@angular/core/testing';
import { VerifiedBadgeComponent } from './verified-badge';

describe('VerifiedBadgeComponent', () => {
  it('renders an accessible Verified image', () => {
    const fixture = TestBed.createComponent(VerifiedBadgeComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Verified');
    expect(el.getAttribute('title')).toBe('Verified');
  });

  it('uses the md size when requested', () => {
    const fixture = TestBed.createComponent(VerifiedBadgeComponent);
    fixture.componentRef.setInput('size', 'md');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).getAttribute('data-size')).toBe('md');
  });
});
