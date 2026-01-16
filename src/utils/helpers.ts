export const formatDate = (
    dateString: string,
    locale = "en-US",
    options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }
): string => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
        }
        return date.toLocaleString(locale, options);
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateString;
    }
};

export const formatCurrency = (
    amount: number,
    decimals = 2,
    locale = "en-US"
): string => {
    try {
        return amount.toLocaleString(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    } catch (error) {
        console.error("Error formatting currency:", error);
        return amount.toFixed(decimals);
    }
};

export const safeJSONParse = <T>(
    value: string | null,
    fallback: T
): T => {
    if (!value) return fallback;
    
    try {
        return JSON.parse(value) as T;
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return fallback;
    }
};

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
