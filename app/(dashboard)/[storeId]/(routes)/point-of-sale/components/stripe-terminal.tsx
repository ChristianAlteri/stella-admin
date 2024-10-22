"use client";

import { useEffect, useState, useRef, useCallback, use } from "react";
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
import { toast } from "react-hot-toast";
import { TbFaceIdError, TbFaceId } from "react-icons/tb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductForm } from "../../products/[productId]/components/product-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wifi } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { currencyConvertor } from "@/lib/utils";

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

interface StripeTerminalComponentProps {
  countryCode: string;
}

export default function StripeTerminalComponent({ countryCode }: StripeTerminalComponentProps) {
  const currencySymbol = currencyConvertor(countryCode)
  const router = useRouter();
  const [urlFrom, setUrlFrom] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loadingReaders, setLoadingReaders] = useState<boolean>(true);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const hasFetchedToken = useRef(false);
  const [selectedReader, setSelectedReader] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isPaymentCaptured, setIsPaymentCaptured] = useState<boolean>(false);
  // const [isSelected, setIsSelected] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState<boolean>(false);
  const [loadingDesigners, setLoadingDesigners] = useState<boolean>(false);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  useEffect(() => {
    if (readers.length > 0) {
      setSelectedReader(readers[0].id);
    } else {
      setSelectedReader("");
    }
  }, [readers]);
  const [activeTab, setActiveTab] = useState("search");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrlFrom(window.location.href);
    }
  }, []);
  const { storeId } = useParams();
  const URL = `/api/${storeId}/mega-search`;

  const useProductSearch = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<
      typeof setTimeout
    > | null>(null);

    // function for searching by seller, category and designer
    const handleSearchById = (passedInId: string) => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      const timeout = setTimeout(async () => {
        try {
          const response = await axios.get(`${URL}`, {
            params: { productName: passedInId, limit: 10 },
          });
          setSearchResults(response.data);
        } catch (error) {
          console.error("Error fetching search results:", error);
          setSearchResults([]);
        }
      }, 300);

      setDebounceTimeout(timeout);
    };

    const handleSearch = useCallback(() => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      const timeout = setTimeout(async () => {
        try {
          const response = await axios.get(`${URL}`, {
            params: { productName: inputRef.current?.value || "", limit: 10 }, // Original search logic
          });
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

    return { inputRef, handleSearch, handleSearchById }; // Return the new function
  };
  // const { inputRef, handleSearch } = useProductSearch();
  const { inputRef, handleSearch, handleSearchById } = useProductSearch();
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        const response = await axios.get(`${URL}`, {
          params: { productName: "", limit: 10 },
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error("Error fetching initial products:", error);
        setSearchResults([]);
      }
    };
    fetchInitialProducts();
  }, []);

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
      const { data, status } = await axios.post(
        `/api/${storeId}/stripe/create_payment_intent`,
        {
          //Send metadata to the back end so we can process the payments and payouts after a terminal triggers a webhook
          amount: amountInCents,
          readerId: selectedReader,
          storeId: storeId,
          productIds: selectedProducts.map((product) => product.id),
          urlFrom: urlFrom,
        }
      );
      setPaymentIntentId(data?.paymentIntent?.id);
      toastSuccess("Payment intent created.");
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.errorCode === "currency_mismatch"
      ) {
        toastError(
          "Currency mismatch. Please check your store's currency settings."
        );
        router.push(`/${storeId}/settings`);
      } else {
        console.error("Error creating payment intent:", error);
        toastError("Error creating payment intent");
      }
    }
  };

  // const simulatePayment = async () => {
  //   if (!selectedReader) {
  //     toastError("Please select a reader.");
  //     return;
  //   }

  //   try {
  //     const { data } = await axios.post(
  //       `/api/${storeId}/stripe/simulate_payment`,
  //       {
  //         readerId: selectedReader,
  //       }
  //     );

  //     if (data.reader?.action?.failure_code) {
  //       // Capture and set error message
  //       setAmount("");
  //       setPaymentIntentId(null);
  //       setIsPaymentCaptured(false);
  //       toastError(data.reader.action.failure_message);
  //     } else {
  //       // Successful payment
  //       setPaymentIntentId(
  //         data.reader?.action?.process_payment_intent?.payment_intent
  //       );
  //       if (
  //         data?.reader?.action?.status === "succeeded" &&
  //         selectedProducts.length > 0
  //       ) {
  //         const verifyResponse = await axios.post(
  //           `/api/${storeId}/verify-terminal-payment?store_id=${storeId}`,
  //           { selectedProducts }, // Pass selectedProducts to verify-terminal-payment
  //           {
  //             headers: {
  //               "Content-Type": "application/json",
  //             },
  //           }
  //         );

  //         if (
  //           !verifyResponse.data.success &&
  //           verifyResponse.data.errorCode === "balance_insufficient"
  //         ) {
  //           toastError(
  //             "Wrong currency or insufficient funds in Stripe account"
  //           );
  //         } else {
  //           toastSuccess("Payment successfully processed!");
  //           setIsPaymentCaptured(true);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error simulating payment:", error);
  //     toastError("Error simulating payment.");
  //   }
  // };

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
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling payment:", error);
    }
  };

  const resetComponent = () => {
    // setAmount("");
    // setPaymentIntentId(null);
    // setIsPaymentCaptured(false);
    // setSelectedReader("");
    // setSelectedProducts([]);
    // setSearchResults([]);

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

  const getSellers = async () => {
    setLoadingSellers(true);
    try {
      const { data } = await axios.get(`/api/${storeId}/sellers`);
      setSellers(data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toastError("Failed to fetch sellers.");
    } finally {
      setLoadingSellers(false);
    }
  };
  const getDesigners = async () => {
    setLoadingDesigners(true);
    try {
      const { data } = await axios.get(`/api/${storeId}/designers`);

      setDesigners(data);
    } catch (error) {
      console.error("Error fetching designers:", error);
      toastError("Failed to fetch designers.");
    } finally {
      setLoadingDesigners(false);
    }
  };
  const getCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data } = await axios.get(`/api/${storeId}/categories`);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toastError("Failed to fetch categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSearchProductByIDClick = (passedInId: string) => {
    console.log("handleSearchProductByIDClick", passedInId);
    handleSearchById(passedInId);
  };

  return (
    <Card className="w-full space-y-4 p-6">
      <CardTitle className="mb-6 text-primary">Point of Sale</CardTitle>
      <div className="flex flex-col">
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-row gap-4 items-start h-full w-full">
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value);
                if (value === "seller") {
                  getSellers();
                } else if (value === "designer") {
                  getDesigners();
                } else if (value === "category") {
                  getCategories();
                }
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="search">Search</TabsTrigger>
                <TabsTrigger value="seller">Seller</TabsTrigger>
                <TabsTrigger value="designer">Designer</TabsTrigger>
                <TabsTrigger value="category">Categories</TabsTrigger>
              </TabsList>

              <TabsContent value="search">
                <div className="flex flex-row gap-4 items-start w-full h-full">
                  {loadingReaders ? (
                    <div className="space-y-4 w-full">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-20 w-20 rounded-md" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                          <Skeleton className="h-10 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card className="w-full  h-[500px]">
                      <CardContent className="p-4 h-full flex flex-col">
                        <div className="flex flex-col gap-2 mb-4">
                          <Input
                            type="text"
                            ref={inputRef}
                            placeholder="Search product"
                            onChange={handleSearch}
                            className="w-full"
                          />
                          {/* <Button
                            variant="outline"
                            className="w-full  opacity-40 hover:opacity-100"
                            onClick={() => setIsDialogOpen(true)}
                          >
                            Create a product
                          </Button> */}
                        </div>
                        <ScrollArea className="flex-grow">
                          {searchResults.length > 0 && (
                            <div className="space-y-4">
                              {searchResults.map((result: any) => (
                                <div
                                  key={result.id}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center w-full rounded-md">
                                    {result.images && result.images[0] && (
                                      <Image
                                        width={80}
                                        height={80}
                                        src={result.images[0].url}
                                        alt={result.name}
                                        className="w-20 h-20 object-cover rounded-md p-2"
                                      />
                                    )}
                                    <div className="flex flex-row gap-2 justify-between text-center items-center w-full">
                                      <div className="flex flex-row gap-2 text-center items-center w-full">
                                        <h3
                                          className="font-semibold hover:cursor-pointer hover:underline"
                                          onClick={() =>
                                            router.push(
                                              `/${storeId}/products/${result.id}/details`
                                            )
                                          }
                                        >
                                          {result.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                          {currencySymbol}{result.ourPrice.toString()}
                                        </p>
                                      </div>
                                      <div className="flex flex-row gap-2 text-end items-center w-full">
                                        <p className="text-xs text-gray-500 w-full mr-4">
                                          {result.seller.storeName ||
                                            result.seller.instagramHandle ||
                                            result.seller.firstName}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() => handleSelect(result)}
                                    variant={
                                      selectedProducts.some(
                                        (p) => p.id === result.id
                                      )
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {selectedProducts.some(
                                      (p) => p.id === result.id
                                    )
                                      ? "Selected"
                                      : "Select for Sale"}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {["seller", "designer", "category"].map((tab) => {
                const isLoading =
                  tab === "seller"
                    ? loadingSellers
                    : tab === "designer"
                    ? loadingDesigners
                    : loadingCategories;

                const items =
                  tab === "seller"
                    ? sellers
                    : tab === "designer"
                    ? designers
                    : categories;

                return (
                  <TabsContent key={tab} value={tab} className="mt-0">
                    <Card className="h-[500px]">
                      <CardHeader>
                        <CardTitle>
                          {tab === "category"
                            ? "Categories"
                            : tab.charAt(0).toUpperCase() + tab.slice(1) + "s"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[calc(100%-80px)]">
                          {isLoading ? (
                            <div className="space-y-2">
                              {[...Array(10)].map((_, i) => (
                                <div
                                  key={i}
                                  className="flex flex-row w-full gap-2"
                                >
                                  <Skeleton key={i} className="h-8 w-1/2" />
                                  <Skeleton key={i} className="h-8 w-1/2" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {items.map((item: any) => (
                                <Button
                                  key={item.id}
                                  variant="outline"
                                  className="justify-start h-auto py-2 px-4"
                                  onClick={() => {
                                    handleSearchProductByIDClick(item.id);
                                    setActiveTab("search");
                                  }}
                                >
                                  {tab === "seller"
                                    ? item.storeName || item.instagramHandle
                                    : item.name}
                                </Button>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>

            <div className="w-full h-[550px]">
              {loadingReaders ? (
                <div className="flex flex-col space-y-4">
                  <div className="w-full h-full">
                    <CardHeader>
                      <Skeleton className="h-8 w-1/3 flex " />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="w-full h-10 rounded-md" />
                      <Skeleton className="w-full h-12 rounded-md" />
                      <div className="grid grid-cols-3 gap-2">
                        {[...Array(12)].map((_, index) => (
                          <Skeleton key={index} className="h-12 rounded-md" />
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      <Skeleton className="w-full h-10 rounded-md" />
                    </CardFooter>
                  </div>
                </div>
              ) : (
                <Card className="w-full h-full">
                  <CardHeader></CardHeader>
                  <CardContent className="space-y-4">
                    {!isPaymentCaptured ? (
                      <>
                        <Select
                          onValueChange={setSelectedReader}
                          value={selectedReader || ""} 
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reader" />
                          </SelectTrigger>
                          <SelectContent>
                            {readers.map((reader) => (
                              <SelectItem key={reader.id} value={reader.id}>
                                <div className="flex gap-2 flex-row justify-center items-center">
                                  {reader.label}
                                  <Wifi
                                    className={`h-4 w-4 flex justify-center items-center  ${
                                      reader.status === "online"
                                        ? "text-green-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </div>
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
                        {!paymentIntentId ? (
                          <Button
                            onClick={() => {
                              createPendingPayment();
                              setIsDialogOpen(true);
                            }}
                            disabled={!selectedReader || !amount}
                            className="w-full"
                          >
                            Create Payment ({currencySymbol}{amount})
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={cancelPayment}
                              disabled={!selectedReader}
                              className="w-full"
                            >
                              Cancel Payment
                            </Button>
                            <Button
                              onClick={() => setIsPaymentCaptured(true)}
                              disabled={!selectedReader}
                              className="w-full"
                            >
                              Approve Card Payment
                            </Button>
                          </>
                        )}
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

          {!paymentIntentId ? ( // If paymentIntentId is not set, show the dialog
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="w-full h-10 rounded-md" />
                  <Skeleton className="w-full h-12 rounded-md" />
                  <div className="grid grid-cols-2 gap-2">
                    {[...Array(4)].map((_, index) => (
                      <Skeleton key={index} className="h-10 rounded-md" />
                    ))}
                  </div>
                  <Skeleton className="w-full h-10 rounded-md" />
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                {!paymentIntentId ? (
                  // Show loading skeleton if no paymentIntentId
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="w-full h-10 rounded-md" />
                    <Skeleton className="w-full h-12 rounded-md" />
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(4)].map((_, index) => (
                        <Skeleton key={index} className="h-10 rounded-md" />
                      ))}
                    </div>
                    <Skeleton className="w-full h-10 rounded-md" />
                  </div>
                ) : (
                  <>
                    {!isPaymentCaptured ? (
                      // Show order summary if payment is not yet captured
                      <>
                        <DialogHeader>
                          <DialogTitle>Order Summary</DialogTitle>
                        </DialogHeader>

                        <Card className="w-full">
                          <CardHeader>
                            <CardTitle className="text-2xl font-bold">
                              Order Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid gap-4">
                            {selectedProducts.length > 0 && (
                              <>
                                <ScrollArea className="h-[150px] pr-4">
                                  {selectedProducts.map((product) => (
                                    <div
                                      key={product.id}
                                      className="flex justify-between py-1"
                                    >
                                      <span className="text-sm text-muted-foreground">
                                        {product.name}
                                      </span>
                                      <span className="text-sm font-medium">
                                        {currencySymbol}{Number(product.ourPrice).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </ScrollArea>
                                <Separator />
                                <div className="flex justify-between">
                                  <span className="text-lg font-bold">
                                    Total
                                  </span>
                                  <span className="text-lg font-bold">
                                    {currencySymbol}{amount}
                                  </span>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                        <DialogFooter>
                          {!paymentIntentId ? (
                            <Button
                              onClick={() => {
                                createPendingPayment();
                                setIsDialogOpen(true);
                              }}
                              disabled={!selectedReader || !amount}
                              className="w-full"
                            >
                              Create Payment ({currencySymbol}{amount})
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={cancelPayment}
                                disabled={!selectedReader}
                                className="w-full"
                              >
                                Cancel Payment
                              </Button>
                              <Button
                                onClick={() => setIsPaymentCaptured(true)}
                                disabled={!selectedReader}
                                className="w-full"
                              >
                                Approve Card Payment
                              </Button>
                            </>
                          )}
                        </DialogFooter>
                      </>
                    ) : (
                      // Show payment success message and print options if payment is captured
                      <>
                        <p className="text-xl font-semibold text-center">
                          Payment successfully captured!
                        </p>
                        <DialogFooter>
                          <Button onClick={resetComponent} className="w-full">
                            New Sale
                          </Button>
                          <Button onClick={printReceipt} className="w-full">
                            Print Receipt
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loadingReaders ? (
          <div className="flex flex-col space-y-4 justify-center items-center p-2">
            <Skeleton className="w-2/3 h-12" />
            <Skeleton className="w-2/3 h-[100px]" />
          </div>
        ) : amount.length > 0 ? (
          <div className="flex justify-center items-center w-full p-2">
            <Card className="w-2/3 h-[200px]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Order Summary
                </CardTitle>
                <CardContent className="grid gap-4">
                  {selectedProducts.length > 0 && (
                    <>
                      <ScrollArea className="h-[50px] pr-4">
                        {selectedProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex justify-between py-1"
                          >
                            <span className="text-sm text-muted-foreground">
                              {product.name}
                            </span>
                            <span className="text-sm font-medium">
                              {currencySymbol}{Number(product.ourPrice).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </ScrollArea>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-lg font-bold">{currencySymbol}{amount}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <div className="flex justify-center items-center w-full p-2">
            <Card className="w-2/3 h-[80px]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Order Summary
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
}
