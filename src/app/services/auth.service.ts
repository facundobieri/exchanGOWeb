import { Injectable, signal, computed } from '@angular/core';
import { User, SubscriptionTier } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<User | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    const stored = localStorage.getItem('exchango_user');
    if (stored) {
      this.currentUser.set(JSON.parse(stored));
    }
    this.seedDefaultData();
  }

  private seedDefaultData(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      const admin: User = {
        id: crypto.randomUUID(),
        username: 'admin',
        email: 'admin@exchango.com',
        password: 'admin123',
        role: 'admin',
        subscription: 'pro',
        tokens: -1,
      };
      this.saveUsers([admin]);
    }
  }

  private getUsers(): User[] {
    const data = localStorage.getItem('exchango_users');
    return data ? JSON.parse(data) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem('exchango_users', JSON.stringify(users));
  }

  login(username: string, password: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }
    this.currentUser.set(user);
    localStorage.setItem('exchango_user', JSON.stringify(user));
    return { success: true };
  }

  register(username: string, email: string, password: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    if (users.some(u => u.username === username)) {
      return { success: false, error: 'Username already exists' };
    }
    if (users.some(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      email,
      password,
      role: 'user',
      subscription: 'free',
      tokens: 10,
    };
    users.push(newUser);
    this.saveUsers(users);
    this.currentUser.set(newUser);
    localStorage.setItem('exchango_user', JSON.stringify(newUser));
    return { success: true };
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('exchango_user');
  }

  useToken(): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.subscription === 'pro') return true;
    if (user.tokens <= 0) return false;

    const updatedUser = { ...user, tokens: user.tokens - 1 };
    this.currentUser.set(updatedUser);
    localStorage.setItem('exchango_user', JSON.stringify(updatedUser));

    const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    this.saveUsers(users);
    return true;
  }

  updateSubscription(tier: SubscriptionTier): void {
    const user = this.currentUser();
    if (!user) return;

    const tokenMap: Record<SubscriptionTier, number> = {
      free: 10,
      trial: 100,
      pro: -1,
    };

    const updatedUser = { ...user, subscription: tier, tokens: tokenMap[tier] };
    this.currentUser.set(updatedUser);
    localStorage.setItem('exchango_user', JSON.stringify(updatedUser));

    const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    this.saveUsers(users);
  }
}
