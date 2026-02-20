import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, SubscriptionTier, LoginResponse, GetUserResponse, UserRole, UserSubscription } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  private readonly currentUser = signal<User | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    const stored = localStorage.getItem('exchango_user');
    if (stored) {
      this.currentUser.set(JSON.parse(stored));
    }
  }

  private persistUser(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem('exchango_user', JSON.stringify(user));
  }

  private mapResponseToUser(dto: GetUserResponse): User {
    const roleVal = dto.role?.toLowerCase() ?? '';
    const subVal = dto.subscription?.toLowerCase() ?? '';
    const isAdmin = roleVal === 'admin';
    let subscription: SubscriptionTier = 'free';
    if (subVal === 'pro') subscription = 'pro';
    else if (subVal === 'estandar') subscription = 'estandar';
    return {
      id: dto.id,
      username: dto.username,
      email: dto.email,
      role: isAdmin ? 'admin' : 'user',
      subscription,
      totalConversions: dto.totalConversions ?? 0,
    };
  }

  login(username: string, password: string): Observable<void> {
    return this.http
      .post<LoginResponse>(`${this.api}/api/Auth/login`, { username, password })
      .pipe(
        tap(res => {
          localStorage.setItem('exchango_token', res.token);
          this.persistUser(this.mapResponseToUser(res.user));
        }),
        map(() => void 0),
        catchError(this.handleError),
      );
  }

  register(username: string, email: string, password: string): Observable<void> {
    return this.http
      .post<LoginResponse>(`${this.api}/api/Auth/register`, { username, email, password })
      .pipe(
        tap(res => {
          if (res.token) {
            localStorage.setItem('exchango_token', res.token);
            this.persistUser(this.mapResponseToUser(res.user));
          }
        }),
        map(() => void 0),
        catchError(this.handleError),
      );
  }

  refreshUser(): Observable<User> {
    if (!this.currentUser()) return throwError(() => new Error('No user logged in'));
    return this.http.get<GetUserResponse>(`${this.api}/api/Profile/me`).pipe(
      tap(dto => this.persistUser(this.mapResponseToUser(dto))),
      map(dto => this.mapResponseToUser(dto)),
      catchError(this.handleError),
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('exchango_user');
    localStorage.removeItem('exchango_token');
  }

  updateSubscription(tier: SubscriptionTier): Observable<void> {
    const tierToEnum: Record<SubscriptionTier, number> = { free: 0, estandar: 1, pro: 2 };
    return this.http
      .patch<void>(`${this.api}/api/Profile/subscription`, { newSubscription: tierToEnum[tier] })
      .pipe(
        tap(() => {
          // Refresh user from server so totalConversions and subscription are in sync
          this.refreshUser().subscribe();
        }),
        map(() => void 0),
        catchError(this.handleError),
      );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred';
    if (err.status === 400 || err.status === 401) {
      message = err.error?.message ?? err.error ?? 'Invalid credentials';
    } else if (err.status === 409) {
      message = err.error?.message ?? 'User already exists';
    } else if (err.status === 0) {
      message = 'Cannot reach the server. Make sure the API is running.';
    }
    return throwError(() => new Error(message));
  }
}
