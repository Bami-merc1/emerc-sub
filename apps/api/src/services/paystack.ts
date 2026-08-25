import axios from "axios";

const paystackApi = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export async function initializeTransaction(email: string, amountKobo: number, reference: string) {
  const res = await paystackApi.post("/transaction/initialize", {
    email,
    amount: amountKobo,
    reference,
    callback_url: `${process.env.FRONTEND_URL}/wallet?status=callback`,
  });
  return res.data;
}

export async function verifyTransaction(reference: string) {
  const res = await paystackApi.get(`/transaction/verify/${reference}`);
  return res.data;
}

export async function resolveAccountNumber(accountNumber: string, bankCode: string) {
  const res = await paystackApi.get(
    `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
  );
  return res.data;
}

export async function listBanks() {
  const res = await paystackApi.get("/bank?country=nigeria");
  return res.data;
}

export async function createTransferRecipient(params: {
  name: string;
  accountNumber: string;
  bankCode: string;
}) {
  const res = await paystackApi.post("/transferrecipient", {
    type: "nuban",
    name: params.name,
    account_number: params.accountNumber,
    bank_code: params.bankCode,
    currency: "NGN",
  });
  return res.data;
}

export async function initiateTransfer(params: {
  amountKobo: number;
  recipientCode: string;
  reference: string;
  reason: string;
}) {
  const res = await paystackApi.post("/transfer", {
    source: "balance",
    amount: params.amountKobo,
    recipient: params.recipientCode,
    reference: params.reference,
    reason: params.reason,
  });
  return res.data;
}

export default paystackApi;