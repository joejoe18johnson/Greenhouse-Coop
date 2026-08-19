import { formatBZD } from "@/lib/utils";

export const ORDER_DEPOSIT_RATE = 0.5;

export const DEPOSIT_NOTICE =
  "A 50% deposit secures your order. The remaining balance is due when you collect your trees.";

export function orderDepositAmount(total: number) {
  return Math.round(total * ORDER_DEPOSIT_RATE * 100) / 100;
}

export function orderBalanceAmount(total: number) {
  return Math.round((total - orderDepositAmount(total)) * 100) / 100;
}

export function formatOrderDeposit(total: number) {
  return formatBZD(orderDepositAmount(total));
}

export function formatOrderBalance(total: number) {
  return formatBZD(orderBalanceAmount(total));
}
