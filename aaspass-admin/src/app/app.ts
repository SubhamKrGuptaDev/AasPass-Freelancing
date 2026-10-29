import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToasterComponent } from './components/toaster/toaster';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToasterComponent],
  templateUrl: './app.html'
})
export class App {}
