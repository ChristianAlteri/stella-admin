import React, { useState } from "react";
import StripeConnect from "./components/stripe-connect";

const StripeConnectPage = async () => {

  return (
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
      <StripeConnect />
    </div>
    </div>
  );
};

export default StripeConnectPage;
