import { ref } from 'vue';

export function usePagination(initialPage = 1, pageSize = 25) {
  const page = ref(initialPage);
  const totalPages = ref(1);
  const pageNumbers = ref([]);
  const jumpPageNumbers = ref([]);

  const updatePageNumbers = () => {
    const pages = [];
    const start = Math.max(1, page.value - 4);
    const end = Math.min(totalPages.value, start + 9);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    pageNumbers.value = pages;
    
    generateJumpPages();
  };

  const calculatePages = (totalItems) => {
    totalPages.value = Math.max(1, Math.ceil(totalItems / pageSize));
    updatePageNumbers();
  };

  const generateJumpPages = () => {
    const pages = [];
    let counter = 0;
    
    for (let i = page.value; i > 0;) {
      counter++;
      pages.unshift(i);
      if (counter < 50) i--;
      else if (counter < 100) i -= 10;
      else if (counter < 150) i -= 100;
      else if (counter < 200) i -= 1000;
      else break;
    }
    
    if (pages[0] !== 1) {
      pages.unshift(1);
    }
    
    counter = 0;
    for (let i = page.value + 1; i <= totalPages.value;) {
      counter++;
      pages.push(i);
      if (counter < 50) i++;
      else if (counter < 100) i += 10;
      else if (counter < 150) i += 100;
      else if (counter < 200) i += 1000;
      else break;
    }
    
    if (pages[pages.length - 1] !== totalPages.value) {
      pages.push(totalPages.value);
    }
    
    jumpPageNumbers.value = pages;
  };

  const setPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage;
      updatePageNumbers();
    }
  };

  return {
    page,
    totalPages,
    pageNumbers,
    jumpPageNumbers,
    calculatePages,
    generateJumpPages,
    setPage
  };
}
