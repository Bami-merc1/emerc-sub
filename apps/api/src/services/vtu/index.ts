import { cheapDataHubProvider } from "./cheapdatahub";
import { peyflexProvider } from "./peyflex";
import { VtuProvider, PurchaseResult } from "./types";

const providers: VtuProvider[] = [cheapDataHubProvider, peyflexProvider];

export async function buyDataWithFallback(params: {
  network: string;
  phone: string;
  planId: string;
}): Promise<PurchaseResult & { providerUsed: string }> {
  for (const provider of providers) {
    const result = await provider.buyData(params);
    if (result.success) {
      return { ...result, providerUsed: provider.name };
    }
  }
  return {
    success: false,
    message: "All VTU providers failed",
    providerUsed: "none",
  };
}

export async function buyAirtimeWithFallback(params: {
  network: string;
  phone: string;
  amount: number;
}): Promise<PurchaseResult & { providerUsed: string }> {
  for (const provider of providers) {
    const result = await provider.buyAirtime(params);
    if (result.success) {
      return { ...result, providerUsed: provider.name };
    }
  }
  return {
    success: false,
    message: "All VTU providers failed",
    providerUsed: "none",
  };
}