import { ref, watch } from "vue";
import { STORAGE_KEYS } from "../constants";

export function useTheme() {
    const isDarkMode = ref(false);

    const loadTheme = () => {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme === "dark") {
            isDarkMode.value = true;
            document.documentElement.classList.add("dark");
        } else {
            isDarkMode.value = false;
            document.documentElement.classList.remove("dark");
        }
    };

    const toggleTheme = () => {
        isDarkMode.value = !isDarkMode.value;
    };

    watch(
        isDarkMode,
        (newValue) => {
            if (newValue) {
                document.documentElement.classList.add("dark");
                localStorage.setItem(STORAGE_KEYS.THEME, "dark");
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem(STORAGE_KEYS.THEME, "light");
            }
        },
        { immediate: false }
    );

    return {
        isDarkMode,
        toggleTheme,
        loadTheme,
    };
}
