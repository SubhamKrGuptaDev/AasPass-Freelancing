import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ShellComponent } from './shell';

describe('ShellComponent', () => {
  it('rendersExactlyOneMainLandmark', async () => {
    TestBed.configureTestingModule({ imports: [ShellComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ShellComponent);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('main').length).toBe(1);
  });
});
