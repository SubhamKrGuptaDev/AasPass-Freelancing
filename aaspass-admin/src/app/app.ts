import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToasterComponent } from './components/toaster/toaster';
import { ThemeService } from './services/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToasterComponent],
  templateUrl: './app.html'
})
export class App {
  // Created at start-up so the theme (and "system" tracking) applies on every page, login included.
  private readonly theme = inject(ThemeService);
}
