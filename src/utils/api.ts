import axios from "axios";
import {
  SearchRequest,
  SearchResponse,
  ProductDetailRequest,
  ProductDetailResponse,
  UserData,
  CartItem,
  Cart,
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  ExchangeRate,
} from "../types/types";
import { API_BASE_URL, LANDING_HOOK } from "../config/contractConfig";

export const searchProducts = async (
  query: string,
): Promise<SearchResponse> => {
  const response = await axios.post<SearchResponse>(
    `${API_BASE_URL}/api/searchProduct`,
    { query } as SearchRequest,
  );
  return response.data;
};

export const getProductDetails = async (
  asin: string,
): Promise<ProductDetailResponse> => {
  const response = await axios.post<ProductDetailResponse>(
    `${API_BASE_URL}/api/productDetails`,
    { asin } as ProductDetailRequest,
  );
  return response.data;
};

export const checkUserRegistration = async (
  privy_id: string,
  wallet_address: string | null,
): Promise<boolean> => {
  const response = await axios.get(
    `${API_BASE_URL}/user/check?privy_id=${privy_id}&wallet_address=${wallet_address || ""}`,
  );
  return response.data.isRegistered;
};

export const registerUser = async (userData: UserData): Promise<UserData> => {
  const response = await axios.post(`${API_BASE_URL}/user`, userData);
  return response.data;
};

export const getCart = async (userId: string): Promise<Cart> => {
  const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
  return response.data;
};

export const addToCart = async ({
  userId,
  item,
}: {
  userId: string;
  item: CartItem;
}): Promise<Cart> => {
  const response = await axios.post(`${API_BASE_URL}/cart/${userId}`, item);
  return response.data;
};

export const removeFromCart = async ({
  userId,
  asin,
}: {
  userId: string;
  asin: string;
}): Promise<Cart> => {
  const response = await axios.delete(`${API_BASE_URL}/cart/${userId}/${asin}`);
  return response.data;
};

export const updateCartItemQuantity = async ({
  userId,
  asin,
  quantity,
}: {
  userId: string;
  asin: string;
  quantity: number;
}): Promise<Cart> => {
  const response = await axios.put(`${API_BASE_URL}/cart/${userId}/${asin}`, {
    quantity,
  });
  return response.data;
};

export const createOrder = async (
  orderDetails: CreateOrderRequest,
): Promise<CreateOrderResponse> => {
  try {
    const response = await axios.post<CreateOrderResponse>(
      `${API_BASE_URL}/api/orders`,
      orderDetails,
    );
    return response.data;
  } catch (error) {
    console.error("Error in createOrder:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      throw new Error(
        `Server error: ${error.response.data.detail || error.message}`,
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  try {
    const response = await axios.get<Order[]>(
      `${API_BASE_URL}/api/orders/${userId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const getAllOrders = async (accessToken: string): Promise<Order[]> => {
  try {
    const response = await axios.get<Order[]>(
      `${API_BASE_URL}/api/admin/orders`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

export const updateOrderStatus = async (
  accessToken: string,
  orderId: string,
  status: string,
  shippingGuide: string,
) => {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ status, shippingGuide }),
  });

  if (!response.ok) {
    throw new Error("Failed to update order status");
  }

  return response.json();
};

export const getOrderDetails = async (
  accessToken: string,
  orderId: string,
): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/api/orders_admin/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch order details");
  }

  const orderData = await response.json();
  return orderData as Order;
};

export const fetchExchangeRate = async (): Promise<ExchangeRate> => {
  const response = await fetch(`${API_BASE_URL}/api/exchange-rate/latest`);

  if (!response.ok) {
    throw new Error("Failed to fetch exchange rate");
  }

  return response.json();
};

export const getStats = async (): Promise<{
  users: number;
  totalPurchases: number;
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};

export const sendFeedback = async (country: string, network: string) => {
  const timestamp = new Date().toISOString();
  const data = { country, network, timestamp };

  try {
    await axios.post(LANDING_HOOK, data);
  } catch (error) {
    console.error("Error sending feedback:", error);
    throw error;
  }
};
