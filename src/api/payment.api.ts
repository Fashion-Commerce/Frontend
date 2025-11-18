/**
 * Payment API Service
 * Handles payment creation and VNPay URL generation
 */

import { http2 } from "@/lib/http2";
import type { CreatePaymentRequest, CreatePaymentResponse } from "@/types";

/**
 * Create payment and generate payment URL
 * @param data - Payment creation data including order_id and payment_method
 * @returns Payment response with payment_url (for vnpay) or success message (for cod)
 */
const createPayment = async (
  data: CreatePaymentRequest
): Promise<CreatePaymentResponse> => {
  const response = await http2.post<any>("v1/payments", data);
  return response.info;
};

export const paymentApi = {
  createPayment,
};
