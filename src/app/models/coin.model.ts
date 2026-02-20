export interface Coin {
  id: number;
  code: string;
  legend: string;
  symbol: string;
  convertibilityIndex: number; // relative to USD
}

export interface CreateCoinRequest {
  code: string;
  legend: string;
  symbol: string;
  convertibilityIndex: number;
}

export interface UpdateCoinRequest {
  legend: string;
  symbol: string;
  convertibilityIndex: number;
}
