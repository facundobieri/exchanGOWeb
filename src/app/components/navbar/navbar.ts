import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navbar" aria-label="Main navigation">
      <a class="navbar-brand" routerLink="/exchanger">
        Exchan<span class="brand-accent">GO</span>
      </a>

      <div class="navbar-links">
        <a routerLink="/exchanger" routerLinkActive="active" class="nav-link">Exchanger</a>
        <a routerLink="/subscription" routerLinkActive="active" class="nav-link">Plans</a>
        @if (isAdmin()) {
          <a routerLink="/admin" routerLinkActive="active" class="nav-link">Admin</a>
        }
      </div>

      <div class="navbar-right">
        <span class="navbar-user">{{ username() }}</span>
        <button class="btn btn-secondary btn-sm" (click)="logout()">Logout</button>
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 12px 24px;
      background-color: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
    }

    .navbar-brand {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-light);
      text-decoration: none;
    }

    .brand-accent {
      color: var(--green-bright);
    }

    .navbar-links {
      display: flex;
      gap: 4px;
      flex: 1;
    }

    .nav-link {
      padding: 8px 16px;
      border-radius: var(--radius);
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color var(--transition), background-color var(--transition);

      &:hover {
        color: var(--text-light);
        background-color: rgba(255, 255, 255, 0.04);
        text-decoration: none;
      }

      &.active {
        color: var(--green-bright);
        background-color: var(--green-dark);
      }
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .navbar-user {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .btn-sm {
      padding: 6px 14px;
      font-size: 0.8rem;
    }
  `,
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
