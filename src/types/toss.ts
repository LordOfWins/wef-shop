export interface TossPaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt: string;
  requestedAt: string;
  receipt?: {
    url: string;
  };
  card?: {
    number: string;
    installmentPlanMonths: number;
    approveNo: string;
    cardType: string;
  };
  failure?: {
    code: string;
    message: string;
  };
}

export interface TossError {
  code: string;
  message: string;
}
