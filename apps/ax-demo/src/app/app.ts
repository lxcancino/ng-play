import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { greet } from '@ng-play/shared/util';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly message = greet('ng-play');
}
