import React, { useState } from "react";
import StoreStripeConnect from "./components/store-stripe-connect";

const OnBoardingPage = async () => {
  return (
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
        <StoreStripeConnect />
      </div>
    </div>
  );
};

export default OnBoardingPage;
