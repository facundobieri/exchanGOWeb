import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Coin, CreateCoinRequest, UpdateCoinRequest } from '../models/coin.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CoinService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  private readonly coinList = signal<Coin[]>([]);
  readonly coins = this.coinList.asReadonly();

  constructor() {
    this.loadCoins().subscribe();
  }

  loadCoins(): Observable<Coin[]> {
    return this.http.get<Coin[]>(`${this.api}/api/Currency`).pipe(
      tap(coins => this.coinList.set(coins)),
      catchError(this.handleError),
    );
  }

  addCoin(coin: CreateCoinRequest): Observable<Coin> {
    return this.http.post<Coin>(`${this.api}/api/Currency`, coin).pipe(
      tap(created => this.coinList.update(list => [...list, created])),
      catchError(this.handleError),
    );
  }

  updateCoin(id: number, updates: UpdateCoinRequest): Observable<Coin> {
    return this.http.put<Coin>(`${this.api}/api/Currency/${id}`, updates).pipe(
      tap(updated => this.coinList.update(list => list.map(c => c.id === id ? updated : c))),
      catchError(this.handleError),
    );
  }

  deleteCoin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/api/Currency/${id}`).pipe(
      tap(() => this.coinList.update(list => list.filter(c => c.id !== id))),
      catchError(this.handleError),
    );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred';
    if (err.status === 400) {
      message = err.error?.message ?? 'Invalid request';
    } else if (err.status === 409) {
      message = err.error?.message ?? 'Currency code already exists';
    } else if (err.status === 0) {
      message = 'Cannot reach the server. Make sure the API is running.';
    }
    return throwError(() => new Error(message));
  }
}
