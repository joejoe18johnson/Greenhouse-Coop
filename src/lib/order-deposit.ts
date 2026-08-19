import { formatBZD } from "@/lib/utils";
import type { PaymentInfo } from "@/types";

export const ORDER_DEPOSIT_RATE = 0.5;

export type PaymentPlan = "deposit" | "full";

export const DEPOSIT_NOTICE =
  "A 50% deposit secures your order. The remaining balance is due when you collect your trees.";

export const FULL_PAYMENT_NOTICE =
  "Pay the full order total now and nothing further is due to Greenhouse Co-Op at pickup.";

export function getPaymentPlan(payment?: Pick<PaymentInfo, "paymentPlan">): PaymentPlan {
  return payment?.paymentPlan ?? "deposit";
}

export function orderDepositAmount(total: number) {
  return Math.round(total * ORDER_DEPOSIT_RATE * 100) / 100;
}

export function orderBalanceAmount(total: number) {
  return Math.round((total - orderDepositAmount(total)) * 100) / 100;
}

export function orderAmountDueNow(total: number, plan: PaymentPlan = "deposit") {
  return plan === "full" ? total : orderDepositAmount(total);
}

export function orderAmountDueLater(total: number, plan: PaymentPlan = "deposit") {
  return plan === "full" ? 0 : orderBalanceAmount(total);
}

export function formatOrderDeposit(total: number) {
  return formatBZD(orderDepositAmount(total));
}

export function formatOrderBalance(total: number) {
  return formatBZD(orderBalanceAmount(total));
}

export function formatAmountDueNow(total: number, plan: PaymentPlan = "deposit") {
  return formatBZD(orderAmountDueNow(total, plan));
}

export function paymentPlanLabel(plan: PaymentPlan) {
  return plan === "full" ? "Full payment" : "50% deposit";
}
