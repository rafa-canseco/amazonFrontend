import { useQuery } from "@tanstack/react-query";
import { fetchExchangeRate } from "../utils/api";
import { ExchangeRate } from "../types/types";

export const useExchangeRate = () => {
  return useQuery<ExchangeRate>({
    queryKey: ["exchangeRate"],
    queryFn: fetchExchangeRate,
    staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 60,
  });
};
