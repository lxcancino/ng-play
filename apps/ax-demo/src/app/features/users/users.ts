import { Component, resource } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { User } from './types';

@Component({
  selector: 'ax-users',
  imports: [],
  template: `<section>
      <h2>Users Dashboard</h2>
      <p>Thisi is small application to test and experiment with this APIs:</p>
      <ul>
        <li><code>resource()</code></li>
        <li><code>rxResource()</code></li>
        <li><code>httpResource()</code></li>
      </ul>
    </section>
    <section>
      <ol>
        @for (user of usersResource.value(); track user.id) {
          <li>
            <span>{{ user.name }}</span>
          </li>
        }
      </ol>
    </section> `,
  styleUrl: './users.css',
})
export default class Users {
  public readonly URL = 'https://jsonplaceholder.typicode.com/users';
  /** Plain Resource function
  public usersResource = resource({
    loader: () => this.fetchUsers(),
  });

  private async fetchUsers(): Promise<User[]> {
    return fetch(this.URL).then((response) => {
      if (!response.ok) throw new Error('Error fetching users ');
      return response.json();
    });
  }
  */
  public usersResource = httpResource<User[]>(() => this.URL);
}
