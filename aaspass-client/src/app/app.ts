import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { ToasterComponent } from './components/toaster/toaster';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToasterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
