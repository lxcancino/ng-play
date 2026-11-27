import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { greet } from '@ng-play/shared/util';
import { Navbar } from './navbar/navbar';

@Component({
  imports: [RouterOutlet, Navbar],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly message = greet('ax-tasks');
}
