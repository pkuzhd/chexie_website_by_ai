import { ref } from 'vue';
import { boardService } from '../services/boardService';

export function useBoardData() {
  const boards = ref([]);
  const boardInfo = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  const loadBoards = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      boards.value = await boardService.getAllBoards();
    } catch (err) {
      error.value = '加载板块列表失败';
      console.error('加载板块列表失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const loadBoardInfo = async (bid) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      boardInfo.value = await boardService.getBoardInfo(bid);
      if (boardInfo.value?.bbstitle) {
        document.title = boardInfo.value.bbstitle;
      }
    } catch (err) {
      error.value = '加载板块信息失败';
      console.error('加载板块信息失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    boards,
    boardInfo,
    isLoading,
    error,
    loadBoards,
    loadBoardInfo
  };
}
