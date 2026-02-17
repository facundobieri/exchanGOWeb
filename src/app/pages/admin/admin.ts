import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CoinService } from '../../services/coin.service';
import { Coin } from '../../models/coin.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Admin {
  private readonly fb = inject(FormBuilder);
  private readonly coinService = inject(CoinService);

  protected readonly coins = this.coinService.coins;
  protected readonly error = signal('');
  protected readonly editingId = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(5)]],
    legend: ['', Validators.required],
    symbol: ['', [Validators.required, Validators.maxLength(5)]],
    convertibilityIndex: [0, [Validators.required, Validators.min(0)]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');
    const value = this.form.getRawValue();
    const editing = this.editingId();

    if (editing) {
      this.coinService.updateCoin(editing, value);
      this.editingId.set(null);
    } else {
      const result = this.coinService.addCoin(value);
      if (!result.success) {
        this.error.set(result.error ?? 'Failed to add coin');
        return;
      }
    }

    this.form.reset({ code: '', legend: '', symbol: '', convertibilityIndex: 0 });
  }

  protected editCoin(coin: Coin): void {
    this.editingId.set(coin.id);
    this.form.setValue({
      code: coin.code,
      legend: coin.legend,
      symbol: coin.symbol,
      convertibilityIndex: coin.convertibilityIndex,
    });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ code: '', legend: '', symbol: '', convertibilityIndex: 0 });
    this.error.set('');
  }

  protected deleteCoin(coin: Coin): void {
    this.coinService.deleteCoin(coin.id);
    if (this.editingId() === coin.id) {
      this.cancelEdit();
    }
  }
}
