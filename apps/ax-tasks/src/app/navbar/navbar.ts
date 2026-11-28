import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  /** Single source of navigation items. Add entries here as the app grows. */
  protected readonly items = [
    { label: 'Tasks List', route: '/tasks' },
    { label: 'Board', route: '/board' },
  ];
}
