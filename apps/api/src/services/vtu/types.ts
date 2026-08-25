export interface DataPlanOption {
  id: string;
  network: string;
  size: string;
  validity: string;
  price: number;
}

export interface PurchaseResult {
  success: boolean;
  providerRef?: string;
  message: string;
}

export interface PinValidationResult {
  valid: boolean;
  denomination?: number;
  message: string;
}

export interface VtuProvider {
  name: string;
  buyData(params: { network: string; phone: string; planId: string }): Promise<PurchaseResult>;
  buyAirtime(params: { network: string; phone: string; amount: number }): Promise<PurchaseResult>;
  validatePin?(params: { network: string; pin: string }): Promise<PinValidationResult>;
}