import type { BankAccount, BankDetails } from "@/types";

export function bankAccounts(bank: BankDetails): BankAccount[] {
  if (bank.accounts?.length) return bank.accounts;
  return [
    {
      bankName: bank.bankName,
      accountName: bank.accountName,
      accountNumber: bank.accountNumber,
      branch: bank.branch,
    },
  ];
}
