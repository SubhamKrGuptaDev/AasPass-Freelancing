import { bookingDateStrip, durationOptions, formatDuration, timeOptions, validateDayRanges } from './booking-time';

describe('booking-time', () => {
  it('durationOptions lists multiples of the slot up to the max', () => {
    expect(durationOptions(45, 120)).toEqual([45, 90]);
    expect(durationOptions(30, 120)).toEqual([30, 60, 90, 120]);
  });

  it.each([
    [45, '45 min'],
    [90, '1 h 30 min'],
    [120, '2 h']
  ])('formatDuration(%i) = %s', (min, label) => {
    expect(formatDuration(min)).toBe(label);
  });

  it('timeOptions steps by 15 minutes over the day', () => {
    const opts = timeOptions();
    expect(opts[0]).toBe('00:00');
    expect(opts[1]).toBe('00:15');
    expect(opts.at(-1)).toBe('23:45');
    expect(opts).toHaveLength(96);
  });

  describe('validateDayRanges', () => {
    it('accepts valid ranges', () => {
      expect(validateDayRanges([{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }])).toBeNull();
    });
    it('rejects end not after start', () => {
      expect(validateDayRanges([{ start: '10:00', end: '10:00' }])).toBe('End time must be after start time');
    });
    it('rejects off-grid times', () => {
      expect(validateDayRanges([{ start: '09:10', end: '10:00' }])).toBe('Times must be on 15-minute boundaries');
    });
    it('rejects overlap and touching ranges', () => {
      const msg = 'Time ranges on the same day must not overlap';
      expect(validateDayRanges([{ start: '09:00', end: '12:00' }, { start: '11:00', end: '13:00' }])).toBe(msg);
      expect(validateDayRanges([{ start: '09:00', end: '12:00' }, { start: '12:00', end: '13:00' }])).toBe(msg);
    });
    it('rejects more than 4 ranges', () => {
      const r = [0, 1, 2, 3, 4].map(i => ({
        start: `${String(i * 2 + 8).padStart(2, '0')}:00`,
        end: `${String(i * 2 + 9).padStart(2, '0')}:00`
      }));
      expect(validateDayRanges(r)).toBe('At most 4 time ranges per day');
    });
  });

  it('bookingDateStrip returns consecutive yyyy-MM-dd days', () => {
    const strip = bookingDateStrip(new Date(2026, 9, 30), 4);
    expect(strip).toEqual(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']);
    expect(bookingDateStrip(new Date(2026, 9, 30))).toHaveLength(31);
  });
});
