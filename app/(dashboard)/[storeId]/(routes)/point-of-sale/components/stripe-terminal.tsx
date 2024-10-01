// // TODO: verify-payment route? update the product to isArchived = true once tha payment has been captured then payout sellers flow.
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Product } from "@prisma/client";
import { toast } from "react-hot-toast"; // Import toast
import { TbFaceIdError, TbFaceId } from "react-icons/tb";
// Custom Toast Error
const toastError = (message: string) => {
  toast.error(message, {
    style: {
      background: "white",
      color: "black",
    },
    icon: <TbFaceIdError size={30} />,
  });
};

// Custom Toast Success
const toastSuccess = (message: string) => {
  toast.success(message, {
    style: {
      background: "white",
      color: "green",
    },
    icon: <TbFaceId size={30} />,
  });
};

interface Reader {
  id: string;
  object: string;
  action: {
    failure_code: string | null;
    failure_message: string | null;
    process_payment_intent: Record<string, unknown>;
    status: string;
    type: string;
  };
  device_sw_version: string;
  device_type: string;
  ip_address: string;
  label: string;
  last_seen_at: number;
  livemode: boolean;
  location: string;
  metadata: Record<string, unknown>;
  serial_number: string;
  status: string;
}

export default function StripeTerminalComponent() {
  const router = useRouter();
  const { storeId } = useParams();
  const useProductSearch = () => {
    const URL = `/api/${storeId}/mega-search`;
    const inputRef = useRef<HTMLInputElement>(null);
    const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<
      typeof setTimeout
    > | null>(null);
    const handleSearch = useCallback(() => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      const timeout = setTimeout(async () => {
        try {
          const response = await axios.get(`${URL}`, {
            params: { productName: inputRef.current?.value || "" },
          });
          console.log("Search results:", response.data);
          setSearchResults(response.data);
        } catch (error) {
          console.error("Error fetching search results:", error);
          setSearchResults([]);
        }
      }, 300);

      setDebounceTimeout(timeout);
    }, [URL, debounceTimeout]);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    return { inputRef, handleSearch };
  };
  const [token, setToken] = useState<string | null>(null);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loadingReaders, setLoadingReaders] = useState<boolean>(true);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const hasFetchedToken = useRef(false);
  const [selectedReader, setSelectedReader] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isPaymentCaptured, setIsPaymentCaptured] = useState<boolean>(false);
  const { inputRef, handleSearch } = useProductSearch();
  const [isSelected, setIsSelected] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const handleSelect = (product: Product) => {
    // Check if the product is already selected
    const isAlreadySelected = selectedProducts.some(
      (selectedProduct) => selectedProduct.id === product.id
    );

    let updatedProducts;
    if (isAlreadySelected) {
      // Remove the product from the selection if it's already selected
      updatedProducts = selectedProducts.filter(
        (selectedProduct) => selectedProduct.id !== product.id
      );
    } else {
      // Add the product to the selected list if not selected
      updatedProducts = [...selectedProducts, product];
    }

    setSelectedProducts(updatedProducts);

    // Update the total amount based on selected products
    const updatedAmount = updatedProducts.reduce((acc, currProduct) => {
      return acc + parseFloat(currProduct.ourPrice.toString());
    }, 0);

    setAmount(updatedAmount.toFixed(2)); // Format the amount to 2 decimal places
  };

  const fetchConnectionToken = async () => {
    try {
      const { data } = await axios.get(
        `/api/${storeId}/stripe/connection_token`
      );
      setToken(data.secret);
    } catch (error) {
      console.error("Error fetching connection token:", error);
      toastError("Failed to fetch connection token.");
    }
  };

  const fetchReaders = async () => {
    try {
      const { data } = await axios.get(`/api/${storeId}/stripe/readers`);
      setReaders(data?.readers || []);
    } catch (error) {
      console.error("Error fetching readers:", error);
      toastError("Failed to fetch readers.");
    } finally {
      setLoadingReaders(false);
    }
  };

  const createPendingPayment = async () => {
    if (!selectedReader || !amount || !storeId) {
      return;
    }
    const amountInCents = Math.round(parseFloat(amount) * 100);
    try {
      const { data } = await axios.post(
        `/api/${storeId}/stripe/create_payment_intent`,
        {
          amount: amountInCents,
          readerId: selectedReader,
          storeId: storeId,  // Pass the storeId in the request body
        }
      );
      setPaymentIntentId(data.paymentIntent?.id);
      toastSuccess("Payment intent created.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.errorCode === "currency_mismatch") {
        toastError("Currency mismatch. Please check your store's currency settings.");
        router.push(`/${storeId}/settings`);
      } else {
        console.error("Error creating payment intent:", error);
        toastError("Error creating payment intent");
      }
    }
  };
  
  

  const simulatePayment = async () => {
    if (!selectedReader) {
      toastError("Please select a reader.");
      return;
    }

    try {
      const { data } = await axios.post(
        `/api/${storeId}/stripe/simulate_payment`,
        {
          readerId: selectedReader,
        }
      );

      if (data.reader?.action?.failure_code) {
        // Capture and set error message
        setAmount("");
        setPaymentIntentId(null);
        setIsPaymentCaptured(false);
        toastError(data.reader.action.failure_message);
      } else {
        // Successful payment
        setPaymentIntentId(
          data.reader?.action?.process_payment_intent?.payment_intent
        );
        if (
          data?.reader?.action?.status === "succeeded" &&
          selectedProducts.length > 0
        ) {
          const verifyResponse = await axios.post(
            `/api/${storeId}/verify-terminal-payment?store_id=${storeId}`,
            { selectedProducts }, // Pass selectedProducts to verify-terminal-payment
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (
            !verifyResponse.data.success &&
            verifyResponse.data.errorCode === "balance_insufficient"
          ) {
            toastError(
              "Wrong currency or insufficient funds in Stripe account"
            );
          } else {
            toastSuccess("Payment successfully processed!");
            setIsPaymentCaptured(true);
          }
        }
      }
    } catch (error) {
      console.error("Error simulating payment:", error);
      toastError("Error simulating payment.");
    }
  };

  // I think this is redundant, we look at the status codes from simulate payment to determine if the payment was successful or not.
  //   const capturePayment = async () => {
  //     if (!paymentIntentId) {
  //       return;
  //     }

  //     try {
  //       const { data } = await axios.post(
  //         `/api/${storeId}/stripe/capture_payment_intent`,
  //         {
  //           payment_intent_id: paymentIntentId,
  //         }
  //       );
  //       // Payment captured, show the print receipt option
  //       setIsPaymentCaptured(true);
  //       toastSuccess("Payment captured.");
  //     } catch (error) {
  //       console.error("Error simulating payment:", error);
  //       toastError("Error simulating payment.");
  //     }
  //   };

  const cancelPayment = async () => {
    if (!selectedReader) {
      console.error("No reader selected.");
      return;
    }

    try {
      const { data } = await axios.post(
        `/api/${storeId}/stripe/cancel_payment`,
        {
          readerId: selectedReader,
        }
      );
      toastSuccess("Payment cancelled.");
      console.log("Payment cancellation response:", data);
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling payment:", error);
    }
  };

  const resetComponent = () => {
    // setSelectedReader("");
    // setAmount("");
    // setPaymentIntentId(null);
    // setIsPaymentCaptured(false);
    window.location.reload();
  };

  const printReceipt = () => {
    // TODO: For now, we'll just open the browser's print dialog
    window.print();
  };

  useEffect(() => {
    if (!hasFetchedToken.current) {
      hasFetchedToken.current = true;
      fetchConnectionToken();
      fetchReaders();
    }
  }, []);

  const handleNumberClick = (num: string) => {
    if (num === "backspace") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (num === ".") {
      if (!amount.includes(".")) {
        setAmount((prev) => prev + num);
      }
    } else {
      setAmount((prev) => prev + num);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Ensure input is valid (numbers and at most one decimal point)
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const keypadButtons = [
    "7",
    "8",
    "9",
    "4",
    "5",
    "6",
    "1",
    "2",
    "3",
    "0",
    ".",
    "backspace",
  ];

  return (
    <div className="flex  w-full items-center justify-center">
      <div className="flex flex-row gap-2 items-center p-4 w-2/3 justify-between">
        {/* <h1 className="text-2xl font-bold mb-4">Stripe Terminal Integration</h1> */}
        {loadingReaders ? (
          <></>
        ) : (
          <Card className="w-full justify-start items-start ">
            <CardContent className="p-4">
              <Input
                type="text"
                ref={inputRef}
                placeholder="Search product"
                onChange={handleSearch}
                className="w-full mb-4"
              />
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  {searchResults.map((result: any) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between "
                    >
                      <div className="flex items-center ">
                        {result.images && result.images[0] && (
                          <img
                            src={result.images[0].url}
                            alt={result.name}
                            className="w-20 h-20 object-cover rounded p-2"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{result.name}</h3>
                          <p className="text-sm text-gray-500">
                            £{result.ourPrice.toString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSelect(result)}
                        variant={
                          selectedProducts.some((p) => p.id === result.id)
                            ? "default"
                            : "outline"
                        }
                      >
                        {selectedProducts.some((p) => p.id === result.id)
                          ? "Selected"
                          : "Select for Sale"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <div className="flex flex-col w-full">
          {loadingReaders ? (
            <p>Loading readers...</p>
          ) : (
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <CardTitle>New Sale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isPaymentCaptured ? (
                  <>
                    <Select onValueChange={setSelectedReader}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reader" />
                      </SelectTrigger>
                      <SelectContent>
                        {readers.map((reader) => (
                          <SelectItem key={reader.id} value={reader.id}>
                            {reader.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="text"
                      placeholder="Amount"
                      value={amount}
                      onChange={handleInputChange}
                      className="text-2xl font-bold text-center"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {keypadButtons.map((num, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleNumberClick(num)}
                          className="h-12 text-lg"
                        >
                          {num === "backspace" ? "Back" : num}
                        </Button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xl font-semibold text-center">
                    Payment successfully captured!
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {!isPaymentCaptured ? (
                  <>
                    <Button
                      onClick={createPendingPayment}
                      disabled={!selectedReader || !amount}
                      className="w-full"
                    >
                      Create Payment (£{amount})
                    </Button>
                    <Button
                      onClick={simulatePayment}
                      disabled={!selectedReader}
                      className="w-full"
                    >
                      Simulate Payment
                    </Button>
                    {/* <Button
                      onClick={capturePayment}
                      disabled={!paymentIntentId}
                      className="w-full"
                    >
                      Capture Payment
                    </Button> */}
                    <Button
                      onClick={cancelPayment}
                      disabled={!selectedReader}
                      className="w-full"
                    >
                      Reset Payment
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={resetComponent} className="w-full">
                      New Payment
                    </Button>
                    <Button onClick={printReceipt} className="w-full">
                      Print Receipt
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
