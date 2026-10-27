import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToasterComponent } from './toaster';
import { ToastService } from '../../services/toast/toast.service';

describe('ToasterComponent', () => {
  let fixture: ComponentFixture<ToasterComponent>;
  let service: ToastService;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ToasterComponent] }).compileComponents();
    fixture = TestBed.createComponent(ToasterComponent);
    service = TestBed.inject(ToastService);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => service.clear());

  it('rendersErrorInAlertRegion', async () => {
    service.error('Something failed');
    await fixture.whenStable();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Something failed');
  });

  it('rendersSuccessInPoliteRegion', async () => {
    service.success('Saved');
    await fixture.whenStable();
    expect(el.querySelector('[aria-live="polite"]')?.textContent).toContain('Saved');
    expect(el.querySelector('[role="alert"]')?.textContent).not.toContain('Saved');
  });

  it('closeButtonDismisses', async () => {
    service.info('Hello');
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('button[aria-label="Dismiss notification"]')?.click();
    await fixture.whenStable();
    expect(service.toasts().length).toBe(0);
    expect(el.querySelector('[data-testid="toast"]')).toBeNull();
  });

  it('focusThenHoverLeaveStaysPaused, and focusout to outside resumes', async () => {
    vi.useFakeTimers();
    try {
      service.success('Hold');
      fixture.detectChanges();
      const toast = el.querySelector<HTMLElement>('[data-testid="toast"]');
      toast?.dispatchEvent(new FocusEvent('focusin'));
      toast?.dispatchEvent(new MouseEvent('mouseenter'));
      toast?.dispatchEvent(new MouseEvent('mouseleave'));
      vi.advanceTimersByTime(10000);
      expect(service.toasts().length).toBe(1);

      const inner = el.querySelector<HTMLElement>('button');
      toast?.dispatchEvent(new FocusEvent('focusout', { relatedTarget: inner }));
      vi.advanceTimersByTime(10000);
      expect(service.toasts().length).toBe(1);

      toast?.dispatchEvent(new FocusEvent('focusout', { relatedTarget: document.body }));
      vi.advanceTimersByTime(4000);
      expect(service.toasts().length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('escapeDismissesFocusedToast', async () => {
    service.warning('Heads up');
    await fixture.whenStable();
    const toast = el.querySelector<HTMLElement>('[data-testid="toast"]');
    toast?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(service.toasts().length).toBe(0);
  });
});
