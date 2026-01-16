import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { fetchExchangeRates } from "../services/exchangeRate";
import { TIME } from "../constants";

export function useExchangeRates() {
    const {
        data: exchangeRates,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["exchangeRates"],
        queryFn: fetchExchangeRates,
        staleTime: TIME.HOUR,
        refetchInterval: TIME.HOUR,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return {
        exchangeRates: computed(() => exchangeRates.value),
        isLoading,
        isError,
        error,
        refetch,
    };
}
