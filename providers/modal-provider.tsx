"use client";

import { useEffect, useState } from "react";

import  StoreModal  from "../components/main-components/create-store-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Create a store modal
  return (
    <>
      <StoreModal /> 
    </>
  );
}