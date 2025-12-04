import axiosInstance from './axiosConfig';

// ==================== TYPES ====================

export type PaymentGateway = 'momo' | 'vnpay' | 'zalopay';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

// ==================== INTERFACES ====================

export interface CreatePaymentRequest {
  roadmap_id: string;
  gateway: PaymentGateway;
  redirect_url?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  data: {
    payment_id: string;
    gateway: PaymentGateway;
    amount: number;
    status: PaymentStatus;
    payment_url: string;
    order_id: string;
  };
  message: string;
}

export interface Payment {
  _id: string;
  student_id: string;
  roadmap_id: string;
  roadmap_title: string;
  amount: number;
  gateway: PaymentGateway;
  status: PaymentStatus;
  order_id: string;
  transaction_id?: string;
  payment_date?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetPaymentListResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    data: Payment[];
  };
  message: string;
}

export interface GetPaymentByIdResponse {
  success: boolean;
  data: Payment;
  message: string;
}

// ==================== API METHODS ====================

export const paymentApi = {
  /**
   * POST /api/student/payments/create
   * Tạo payment và nhận payment URL để redirect user đến cổng thanh toán
   */
  createPayment: async (data: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    const response = await axiosInstance.post('/student/payments/create', data);
    return response.data;
  },

  /**
   * GET /api/student/payments
   * Lấy danh sách payment history của student
   */
  getPaymentList: async (page: number = 1, limit: number = 10): Promise<GetPaymentListResponse> => {
    const response = await axiosInstance.get('/student/payments', {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * GET /api/student/payments/:id
   * Lấy chi tiết một payment theo ID
   */
  getPaymentById: async (paymentId: string): Promise<GetPaymentByIdResponse> => {
    const response = await axiosInstance.get(`/student/payments/${paymentId}`);
    return response.data;
  },

  /**
   * POST /api/student/payments/:id/verify
   * Xác nhận payment thủ công (cho test environment)
   */
  verifyPayment: async (paymentId: string): Promise<{
    success: boolean;
    data: {
      payment_id: string;
      status: string;
      message: string;
      enrollment_id?: string;
    };
    message: string;
  }> => {
    const response = await axiosInstance.post(`/student/payments/${paymentId}/verify`);
    return response.data;
  }
};
