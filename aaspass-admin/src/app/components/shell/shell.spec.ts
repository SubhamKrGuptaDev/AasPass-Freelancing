import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminApiService } from '../../services/admin-api.service';
import { ShellComponent } from './shell';

describe('ShellComponent', () => {
  const setup = (newContactRequests: number) => {
    const dashboard = vi.fn().mockReturnValue(of({ newContactRequests }));
    TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [provideRouter([]), { provide: AdminApiService, useValue: { dashboard } }]
    });
    return TestBed.createComponent(ShellComponent);
  };

  it('rendersExactlyOneMainLandmark', async () => {
    const fixture = setup(0);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('main').length).toBe(1);
  });

  it('showsSupportNavItemWithABadge', async () => {
    const fixture = setup(3);
    await fixture.whenStable();
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a[href="/support"]');
    expect(link?.textContent).toContain('Support');
    expect(link?.querySelector('[data-testid="support-badge"]')?.textContent?.trim()).toBe('3');
  });

  it('hidesTheBadgeWhenThereAreNoNewRequests', async () => {
    const fixture = setup(0);
    await fixture.whenStable();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[data-testid="support-badge"]')).toBeNull();
  });
});
