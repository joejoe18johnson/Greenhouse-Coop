import { formatBZD } from "@/lib/utils";
import type { PaymentInfo } from "@/types";

export const ORDER_DEPOSIT_RATE = 0.5;

export type PaymentPlan = "deposit" | "full";
export type PaymentContext = Pick<PaymentInfo, "paymentPlan" | "method">;

export const DEPOSIT_NOTICE =
  "A 50% deposit secures your order. The remaining balance is due when you collect your trees.";

export const FULL_PAYMENT_NOTICE =
  "Pay the full order total now and nothing further is due to Greenhouse Co-Op at pickup.";

export const COD_NOTICE =
  "Pay the full order total in cash when we deliver or when you collect. No deposit or bank transfer required.";

export function isCashOnDelivery(payment?: PaymentContext): boolean {
  return payment?.method === "cod";
}

export function getPaymentPlan(payment?: PaymentContext): PaymentPlan {
  return payment?.paymentPlan ?? "deposit";
}

export function orderDepositAmount(total: number) {
  return Math.round(total * ORDER_DEPOSIT_RATE * 100) / 100;
}

export function orderBalanceAmount(total: number) {
  return Math.round((total - orderDepositAmount(total)) * 100) / 100;
}

export function orderAmountDueNow(total: number, payment?: PaymentContext) {
  if (isCashOnDelivery(payment)) return 0;
  const plan = getPaymentPlan(payment);
  return plan === "full" ? total : orderDepositAmount(total);
}

export function orderAmountDueLater(total: number, payment?: PaymentContext) {
  if (isCashOnDelivery(payment)) return total;
  const plan = getPaymentPlan(payment);
  return plan === "full" ? 0 : orderBalanceAmount(total);
}

export function formatOrderDeposit(total: number) {
  return formatBZD(orderDepositAmount(total));
}

export function formatOrderBalance(total: number) {
  return formatBZD(orderBalanceAmount(total));
}

export function formatAmountDueNow(total: number, payment?: PaymentContext) {
  return formatBZD(orderAmountDueNow(total, payment));
}

export function paymentPlanLabel(plan: PaymentPlan) {
  return plan === "full" ? "Full payment" : "50% deposit";
}

export function paymentMethodLabel(payment?: PaymentContext) {
  if (isCashOnDelivery(payment)) return "Cash on delivery";
  return paymentPlanLabel(getPaymentPlan(payment));
}
