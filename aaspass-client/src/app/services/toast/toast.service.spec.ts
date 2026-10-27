import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    service.clear();
    vi.useRealTimers();
  });

  it('addsToast', () => {
    service.success('Saved', 'Done');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0]).toMatchObject({ type: 'success', message: 'Saved', title: 'Done', durationMs: 4000 });
  });

  it('autoDismissesSuccessAfter4s', () => {
    service.success('Saved');
    vi.advanceTimersByTime(3999);
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
  });

  it('autoDismissesErrorAfter6s', () => {
    service.error('Boom');
    vi.advanceTimersByTime(5999);
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
  });

  it('capsAtFour', () => {
    for (let i = 1; i <= 5; i++) {
      service.info(`m${i}`);
    }
    expect(service.toasts().map((t) => t.message)).toEqual(['m2', 'm3', 'm4', 'm5']);
  });

  it('dedupesIdenticalMessage', () => {
    service.error('Same');
    vi.advanceTimersByTime(5000);
    service.error('Same');
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(5000);
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(service.toasts().length).toBe(0);
  });

  it('pauseStopsTimer', () => {
    service.success('Hold');
    const id = service.toasts()[0].id;
    vi.advanceTimersByTime(1000);
    service.pause(id);
    vi.advanceTimersByTime(20000);
    expect(service.toasts().length).toBe(1);
    service.resume(id);
    vi.advanceTimersByTime(2999);
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
  });

  it('duplicateWhilePausedStaysPausedWithFullTime', () => {
    service.error('Same');
    const id = service.toasts()[0].id;
    vi.advanceTimersByTime(1000);
    service.pause(id);
    service.error('Same');
    vi.advanceTimersByTime(10000);
    expect(service.toasts().length).toBe(1);
    service.resume(id);
    vi.advanceTimersByTime(5999);
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
  });

  it('dismissRemoves', () => {
    service.warning('Careful');
    service.dismiss(service.toasts()[0].id);
    expect(service.toasts().length).toBe(0);
  });

  it('clearRemovesAll', () => {
    service.info('a');
    service.error('b');
    service.clear();
    expect(service.toasts().length).toBe(0);
  });
});
