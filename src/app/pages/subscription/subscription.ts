import { ChangeDetectionStrategy, Component, inject, computed, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { SUBSCRIPTION_PLANS } from '../../models/subscription.model';
import { SubscriptionTier } from '../../models/user.model';

@Component({
  selector: 'app-subscription',
  imports: [],
  templateUrl: './subscription.html',
  styleUrl: './subscription.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Subscription {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly user = this.auth.user;
  protected readonly plans = SUBSCRIPTION_PLANS;
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly currentTier = computed(() => this.user()?.subscription ?? 'free');

  protected selectPlan(tier: SubscriptionTier): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.updateSubscription(tier)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loading.set(false),
        error: (err: Error) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }
}
