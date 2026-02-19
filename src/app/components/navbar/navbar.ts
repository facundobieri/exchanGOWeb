import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly auth = inject(AuthService);

  protected readonly username = computed(() => this.auth.user()?.username ?? '');
  protected readonly isAdmin = this.auth.isAdmin;

  protected logout(): void {
    this.auth.logout();
    // Navigation handled by guard
    window.location.href = '/login';
  }
}
