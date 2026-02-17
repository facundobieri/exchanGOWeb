import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CoinService } from '../../services/coin.service';
import { AuthService } from '../../services/auth.service';
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
  private readonly auth = inject(AuthService);

  protected readonly coins = this.coinService.coins;
  protected readonly user = this.auth.user;
  protected readonly result = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly resultCoinSymbol = signal('');

  protected readonly tokensDisplay = computed(() => {
    const u = this.user();
    if (!u) return '';
    if (u.subscription === 'pro') return '∞';
    return String(u.tokens);
  });

  protected readonly form = this.fb.nonNullable.group({
    fromCoin: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    toCoin: ['', Validators.required],
  });

  protected onConvert(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.result.set(null);

    const { fromCoin, toCoin, amount } = this.form.getRawValue();

    if (fromCoin === toCoin) {
      this.error.set('Please select two different currencies');
      return;
    }

    if (!this.auth.useToken()) {
      this.error.set('No tokens remaining. Upgrade your subscription to continue.');
      return;
    }

    const converted = this.coinService.convert(fromCoin, toCoin, amount);
    if (converted === null) {
      this.error.set('Conversion error. Please try again.');
      return;
    }

    const targetCoin = this.coins().find(c => c.code === toCoin);
    this.resultCoinSymbol.set(targetCoin?.symbol ?? '');
    this.result.set(converted);
  }
}
