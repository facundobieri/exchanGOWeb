import { Injectable, signal } from '@angular/core';
import { Coin } from '../models/coin.model';

@Injectable({ providedIn: 'root' })
export class CoinService {
  private readonly coinList = signal<Coin[]>([]);
  readonly coins = this.coinList.asReadonly();

  constructor() {
    this.loadCoins();
  }

  private loadCoins(): void {
    const stored = localStorage.getItem('exchango_coins');
    if (stored) {
      this.coinList.set(JSON.parse(stored));
    } else {
      const defaults: Coin[] = [
        { id: crypto.randomUUID(), code: 'USD', legend: 'US Dollar', symbol: '$', convertibilityIndex: 1 },
        { id: crypto.randomUUID(), code: 'EUR', legend: 'Euro', symbol: '€', convertibilityIndex: 1.08 },
        { id: crypto.randomUUID(), code: 'GBP', legend: 'British Pound', symbol: '£', convertibilityIndex: 1.26 },
        { id: crypto.randomUUID(), code: 'ARS', legend: 'Peso Argentino', symbol: '$', convertibilityIndex: 0.0009 },
        { id: crypto.randomUUID(), code: 'BRL', legend: 'Real Brasileño', symbol: 'R$', convertibilityIndex: 0.17 },
        { id: crypto.randomUUID(), code: 'JPY', legend: 'Japanese Yen', symbol: '¥', convertibilityIndex: 0.0067 },
      ];
      this.coinList.set(defaults);
      this.persist();
    }
  }

  private persist(): void {
    localStorage.setItem('exchango_coins', JSON.stringify(this.coinList()));
  }

  addCoin(coin: Omit<Coin, 'id'>): { success: boolean; error?: string } {
    const existing = this.coinList();
    if (existing.some(c => c.code.toUpperCase() === coin.code.toUpperCase())) {
      return { success: false, error: `Coin with code "${coin.code}" already exists` };
    }
    const newCoin: Coin = { ...coin, id: crypto.randomUUID(), code: coin.code.toUpperCase() };
    this.coinList.update(list => [...list, newCoin]);
    this.persist();
    return { success: true };
  }

  updateCoin(id: string, updates: Partial<Omit<Coin, 'id'>>): void {
    this.coinList.update(list =>
      list.map(c => c.id === id ? { ...c, ...updates } : c)
    );
    this.persist();
  }

  deleteCoin(id: string): void {
    this.coinList.update(list => list.filter(c => c.id !== id));
    this.persist();
  }

  convert(fromCode: string, toCode: string, amount: number): number | null {
    const coins = this.coinList();
    const from = coins.find(c => c.code === fromCode);
    const to = coins.find(c => c.code === toCode);
    if (!from || !to || to.convertibilityIndex === 0) return null;

    // Convert from source to USD, then from USD to target
    const usdAmount = amount * from.convertibilityIndex;
    return usdAmount / to.convertibilityIndex;
  }
}
