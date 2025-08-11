// Modal state management hook

import { useState, useCallback } from 'react';

interface ModalState {
  isOpen: boolean;
  data?: any;
  type?: string;
}

interface UseModalStateReturn {
  modalState: ModalState;
  openModal: (type?: string, data?: any) => void;
  closeModal: () => void;
  toggleModal: (type?: string, data?: any) => void;
  isModalOpen: boolean;
  modalData: any;
  modalType: string | undefined;
}

/**
 * Hook for managing modal state
 * Useful for AI DM dialogs, character sheets, inventory, etc.
 */
export function useModalState(initialState: ModalState = { isOpen: false }): UseModalStateReturn {
  const [modalState, setModalState] = useState<ModalState>(initialState);

  const openModal = useCallback((type?: string, data?: any) => {
    setModalState({
      isOpen: true,
      type,
      data,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      type: undefined,
      data: undefined,
    });
  }, []);

  const toggleModal = useCallback((type?: string, data?: any) => {
    setModalState(prev => ({
      isOpen: !prev.isOpen,
      type: prev.isOpen ? undefined : type,
      data: prev.isOpen ? undefined : data,
    }));
  }, []);

  return {
    modalState,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen: modalState.isOpen,
    modalData: modalState.data,
    modalType: modalState.type,
  };
}

export default useModalState;