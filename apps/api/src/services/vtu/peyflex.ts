import axios from "axios";
import { VtuProvider } from "./types";

const client = axios.create({
  baseURL: process.env.PEYFLEX_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.PEYFLEX_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const peyflexProvider: VtuProvider = {
  name: "Peyflex",

  async buyData({ network, phone, planId }) {
    try {
      const res = await client.post("/data/purchase", {
        network,
        phone,
        plan: planId,
      });
      return {
        success: res.data.status === "success",
        providerRef: res.data.reference,
        message: res.data.message || "Data purchase submitted",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Peyflex request failed",
      };
    }
  },

  async buyAirtime({ network, phone, amount }) {
    try {
      const res = await client.post("/airtime/purchase", {
        network,
        phone,
        amount,
      });
      return {
        success: res.data.status === "success",
        providerRef: res.data.reference,
        message: res.data.message || "Airtime purchase submitted",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Peyflex request failed",
      };
    }
  },
};