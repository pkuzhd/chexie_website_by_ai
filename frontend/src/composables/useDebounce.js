import { ref } from 'vue';

export function useDebounce(delay = 500) {
  const isDisabled = ref(false);

  const debounce = (fn) => {
    return async (...args) => {
      if (isDisabled.value) return;
      
      isDisabled.value = true;
      try {
        await fn(...args);
      } finally {
        setTimeout(() => {
          isDisabled.value = false;
        }, delay);
      }
    };
  };

  return {
    isDisabled,
    debounce
  };
}
