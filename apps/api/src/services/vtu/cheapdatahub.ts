import axios from "axios";
import { VtuProvider, PurchaseResult } from "./types";

const client = axios.create({
  baseURL: process.env.CHEAPDATAHUB_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.CHEAPDATAHUB_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const cheapDataHubProvider: VtuProvider = {
  name: "CheapDataHub",

  async buyData({ network, phone, planId }) {
    try {
      const res = await client.post("/data/purchase/", {
        network,
        phone_number: phone,
        plan_id: planId,
      });
      return {
        success: res.data.status === true || res.data.status === "true",
        providerRef: res.data.transaction_id?.toString(),
        message: res.data.message || "Data purchase submitted",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "CheapDataHub request failed",
      };
    }
  },

  async buyAirtime({ network, phone, amount }) {
    try {
      const res = await client.post("/airtime/purchase/", {
        network,
        phone_number: phone,
        amount,
      });
      return {
        success: res.data.status === true || res.data.status === "true",
        providerRef: res.data.transaction_id?.toString(),
        message: res.data.message || "Airtime purchase submitted",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "CheapDataHub request failed",
      };
    }
  },

    async validatePin({ network, pin }: { network: string; pin: string }) {
    try {
      const res = await client.post("/pin/validate/", {
        network,
        pin,
      });
      return {
        valid: res.data.status === true || res.data.status === "true",
        denomination: res.data.denomination,
        message: res.data.message || "PIN validated",
      };
    } catch (err: any) {
      return {
        valid: false,
        message: err.response?.data?.message || "PIN validation failed",
      };
    }
  },
};