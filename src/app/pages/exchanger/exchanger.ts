import { ChangeDetectionStrategy, Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CoinService } from '../../services/coin.service';
import { AuthService } from '../../services/auth.service';
import { ConversionService } from '../../services/conversion.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-exchanger',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './exchanger.html',
  styleUrl: './exchanger.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Exchanger {
  private readonly fb = inject(FormBuilder);
  private readonly coinService = inject(CoinService);
  private readonly conversionService = inject(ConversionService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly coins = this.coinService.coins;
  protected readonly user = this.auth.user;
  protected readonly result = signal<number | null>(null);
  protected readonly resultCoinSymbol = signal('');
  protected readonly error = signal('');
  protected readonly loading = signal(false);

  protected readonly tokensDisplay = computed(() => {
    const u = this.user();
    if (!u) return '';
    if (u.subscription === 'pro') return '\u221e';
    return String(u.totalConversions);
  });

  protected readonly form = this.fb.nonNullable.group({
    fromCoinCode: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    toCoinCode: ['', Validators.required],
  });

  protected onConvert(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { fromCoinCode, toCoinCode, amount } = this.form.getRawValue();

    if (fromCoinCode === toCoinCode) {
      this.error.set('Please select two different currencies');
      return;
    }

    this.error.set('');
    this.result.set(null);
    this.loading.set(true);

    this.conversionService
      .convert({ sourceCurrencyCode: fromCoinCode, targetCurrencyCode: toCoinCode, amount })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          const targetCoin = this.coins().find(c => c.code === toCoinCode);
          this.resultCoinSymbol.set(targetCoin?.symbol ?? '');
          this.result.set(res.targetAmount);
          this.loading.set(false);
          this.auth.refreshUser().subscribe();
        },
        error: (err: Error) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }
}

