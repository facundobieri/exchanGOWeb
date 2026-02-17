import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
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

  protected readonly user = this.auth.user;
  protected readonly plans = SUBSCRIPTION_PLANS;

  protected readonly currentTier = computed(() => this.user()?.subscription ?? 'free');

  protected selectPlan(tier: SubscriptionTier): void {
    this.auth.updateSubscription(tier);
  }
}
