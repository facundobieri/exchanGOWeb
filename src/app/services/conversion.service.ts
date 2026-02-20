import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ConversionRequest {
  sourceCurrencyCode: string;
  targetCurrencyCode: string;
  amount: number;
}

export interface ConversionResponse {
  sourceAmount: number;
  sourceCurrency: string;
  targetAmount: number;
  targetCurrency: string;
  exchangeRate: number;
}

@Injectable({ providedIn: 'root' })
export class ConversionService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  convert(request: ConversionRequest): Observable<ConversionResponse> {
    return this.http
      .post<ConversionResponse>(`${this.api}/api/Conversion`, request)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let message = 'Conversion failed';
    if (err.status === 400) {
      message = err.error?.message ?? 'Invalid conversion request';
    } else if (err.status === 403) {
      message = 'No tokens remaining. Upgrade your subscription to continue.';
    } else if (err.status === 0) {
      message = 'Cannot reach the server. Make sure the API is running.';
    }
    return throwError(() => new Error(message));
  }
}
