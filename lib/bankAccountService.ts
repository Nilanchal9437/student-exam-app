/**
 * lib/bankAccountService.ts
 * Nigerian bank account management — get bank account, update bank account.
 * Endpoints: /api/users/bank-account
 */

import apiClient from "./apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BankAccount {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

export interface BankAccountResponse {
  success: boolean;
  message: string;
  data: {
    bankAccount: BankAccount;
  };
}

export interface UpdateBankAccountPayload {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

export interface UpdateBankAccountResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      fullName: string;
      email: string;
      phone?: string;
      className?: string;
      bankAccount: BankAccount;
      createdAt: string;
      updatedAt: string;
    };
  };
}

// ─── Get Bank Account ─────────────────────────────────────────────────────────
export async function getBankAccount(): Promise<BankAccountResponse> {
  const { data } = await apiClient.get("/users/bank-account");
  return data;
}

// ─── Update Bank Account ──────────────────────────────────────────────────────
export async function updateBankAccount(
  payload: UpdateBankAccountPayload
): Promise<UpdateBankAccountResponse> {
  const { data } = await apiClient.put("/users/bank-account", payload);
  return data;
}
