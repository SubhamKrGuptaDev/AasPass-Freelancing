import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartSeries, ColumnChartComponent, compact, niceStep } from './column-chart';

describe('ColumnChartComponent', () => {
  let fixture: ComponentFixture<ColumnChartComponent>;
  let el: HTMLElement;

  const render = (series: ChartSeries[]) => {
    fixture = TestBed.createComponent(ColumnChartComponent);
    fixture.componentRef.setInput('label', 'New users per period');
    fixture.componentRef.setInput('ticks', ['1 Oct', '2 Oct', '3 Oct']);
    fixture.componentRef.setInput('labels', ['Wed, 1 Oct 2026', 'Thu, 2 Oct 2026', 'Fri, 3 Oct 2026']);
    fixture.componentRef.setInput('series', series);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  };

  it('niceStepAndCompactPickReadableTicks', () => {
    expect(niceStep(0)).toBe(1);
    expect(niceStep(4)).toBe(1);
    expect(niceStep(9)).toBe(5);
    expect(niceStep(37)).toBe(10);
    expect(niceStep(180)).toBe(50);
    expect(compact(950)).toBe('950');
    expect(compact(1200)).toBe('1.2K');
    expect(compact(3_000_000)).toBe('3M');
  });

  it('drawsOneColumnPerNonZeroValueAndNoLegendForOneSeries', () => {
    render([{ name: 'New users', color: '#2a78d6', values: [2, 0, 5] }]);
    expect(el.querySelectorAll('path').length).toBe(2);
    expect(el.querySelector('ul')).toBeNull();
    expect(el.querySelector('svg')?.getAttribute('aria-label')).toContain('New users per period');
  });

  it('showsLegendAndGroupedColumnsForTwoSeries', () => {
    render([
      { name: 'Verified', color: '#2a78d6', values: [1, 2, 3] },
      { name: 'Rejected', color: '#eb6834', values: [1, 0, 1] }
    ]);
    expect(el.querySelector('ul')?.textContent).toContain('Verified');
    expect(el.querySelector('ul')?.textContent).toContain('Rejected');
    expect(el.querySelectorAll('path').length).toBe(5);
  });

  it('keyboardMovesTheTooltipAcrossBuckets', () => {
    render([{ name: 'New users', color: '#2a78d6', values: [2, 0, 5] }]);
    const svg = el.querySelector('svg') as SVGElement;
    svg.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="chart-tooltip"]')?.textContent).toContain('Fri, 3 Oct 2026');
    expect(el.querySelector('[data-testid="chart-tooltip"]')?.textContent).toContain('5');
    svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="chart-tooltip"]')?.textContent).toContain('Thu, 2 Oct 2026');
    svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="chart-tooltip"]')).toBeNull();
  });

  it('listsEveryValueInTheDataTable', () => {
    render([{ name: 'New users', color: '#2a78d6', values: [2, 0, 5] }]);
    const cells = Array.from(el.querySelectorAll('tbody td')).map((c) => c.textContent?.trim());
    expect(cells).toEqual(['2', '0', '5']);
  });
});
