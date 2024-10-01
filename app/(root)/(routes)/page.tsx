'use client'

import { useStoreModal } from "@/hooks/use-store-modal";
import { useEffect } from "react";

// this is the setup page that calls the create a store modal
const  SetupPage = () => {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  return null
};

export default SetupPage;
