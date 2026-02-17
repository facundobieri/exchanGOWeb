export interface Coin {
  id: string;
  code: string;
  legend: string;
  symbol: string;
  convertibilityIndex: number; // relative to USD
}
