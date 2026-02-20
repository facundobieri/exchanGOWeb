import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private readonly destroyRef = inject(DestroyRef);

  protected readonly coins = this.coinService.coins;
  protected readonly error = signal('');
  protected readonly loading = signal(false);
  protected readonly editingId = signal<number | null>(null);

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
    this.loading.set(true);
    const value = this.form.getRawValue();
    const editing = this.editingId();

    const op$ = editing
      ? this.coinService.updateCoin(editing, {
          legend: value.legend,
          symbol: value.symbol,
          convertibilityIndex: value.convertibilityIndex,
        })
      : this.coinService.addCoin(value);

    op$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loading.set(false);
        this.editingId.set(null);
        this.form.reset({ code: '', legend: '', symbol: '', convertibilityIndex: 0 });
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
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
    this.loading.set(true);
    this.coinService
      .deleteCoin(coin.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          if (this.editingId() === coin.id) this.cancelEdit();
        },
        error: (err: Error) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }
}
