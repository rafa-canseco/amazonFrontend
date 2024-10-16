import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./utils/api";
import { Cart, CartItem } from "./types/types";

export const useProductDetails = (asin: string) => {
  return useQuery({
    queryKey: ["product", asin],
    queryFn: () => api.getProductDetails(asin),
    staleTime: 1000 * 60 * 5,
    enabled: !!asin,
  });
};

export const useCart = (userId: string) => {
  return useQuery({
    queryKey: ["cart", userId],
    queryFn: () => api.getCart(userId),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addToCart,
    onSuccess: (data: Cart, variables: { userId: string; item: CartItem }) => {
      queryClient.setQueryData(["cart", variables.userId], data);
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.removeFromCart,
    onSuccess: (data: Cart, variables: { userId: string; asin: string }) => {
      queryClient.setQueryData(["cart", variables.userId], data);
    },
  });
};

export const useVariantPrice = (asin: string) => {
  return useQuery({
    queryKey: ["variantPrice", asin],
    queryFn: () => api.getVariantPrice(asin),
    staleTime: 1000 * 60 * 5,
    enabled: !!asin,
  });
};
