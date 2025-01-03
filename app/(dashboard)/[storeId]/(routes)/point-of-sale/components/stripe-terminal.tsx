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
import { Product, Staff } from "@prisma/client";
import { toast } from "react-hot-toast";
import { TbFaceIdError, TbFaceId } from "react-icons/tb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
import PrintableReceipt from "./printable-receipt";
import { createRoot } from "react-dom/client";
import CreateUserDialog from "./create-user-dialog";
import { AvatarFallback } from "@/components/ui/avatar";

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
  storeName: string;
  taxRate: number;
}

export default function StripeTerminalComponent({
  countryCode,
  storeName,
  taxRate,
}: StripeTerminalComponentProps) {
  const currencySymbol = currencyConvertor(countryCode);
  const router = useRouter();
  const [urlFrom, setUrlFrom] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loadingReaders, setLoadingReaders] = useState<boolean>(true);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const hasFetchedToken = useRef(false);
  const [selectedReader, setSelectedReader] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [taxAmount, setTaxAmount] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [isPaymentCaptured, setIsPaymentCaptured] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState<boolean>(false);
  const [loadingDesigners, setLoadingDesigners] = useState<boolean>(false);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [users, setUsers] = useState<Staff[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isCash, setIsCash] = useState<boolean>(false);

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
          // Hitting the mega-search route that our front end store uses
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
          // Hitting the pos specific route
          const response = await axios.get(`${URL}/point-of-sale`, {
            params: { productName: inputRef.current?.value || "", limit: 10 }, // Original search logic
          });
          setSearchResults(response.data);
        } catch (error) {
          console.error("Error fetching search results:", error);
          setSearchResults([]);
        }
      }, 400);

      setDebounceTimeout(timeout);
    }, [debounceTimeout]);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    return { inputRef, handleSearch, handleSearchById }; // Return the new function
  };
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
  }, [URL]);

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

    // Calculate tax amount and update total amount
    const calculatedTax = (updatedAmount * (taxRate / 100)).toFixed(2);
    setTaxAmount(calculatedTax);

    const calculatedTotal = (updatedAmount + parseFloat(calculatedTax)).toFixed(
      2
    );
    setTotalAmount(calculatedTotal);
  };
  // const handleSelect = (product: Product) => {
  //   const isAlreadySelected = selectedProducts.some(
  //     (selectedProduct) => selectedProduct.id === product.id
  //   );

  //   let updatedProducts;
  //   if (isAlreadySelected) {
  //     updatedProducts = selectedProducts.filter(
  //       (selectedProduct) => selectedProduct.id !== product.id
  //     );
  //   } else {
  //     updatedProducts = [...selectedProducts, product];
  //   }

  //   setSelectedProducts(updatedProducts);

  //   const updatedAmount = updatedProducts.reduce((acc, currProduct) => {
  //     return acc + parseFloat(currProduct.ourPrice.toString());
  //   }, 0);

  //   console.log("updatedAmount", updatedAmount);
  //   setAmount(updatedAmount.toFixed(2));

  //   // Calculate tax amount and update total amount
  //   const calculatedTax = (updatedAmount * (taxRate / 100)).toFixed(2);
  //   setTaxAmount(calculatedTax);

  //   const calculatedTotal = (updatedAmount + parseFloat(calculatedTax)).toFixed(
  //     2
  //   );
  //   setTotalAmount(calculatedTotal);
  // };

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
      // Define the type for grouped products
      type GroupedProducts = {
        [key: string]: {
          productId: string[];
          productName: string[];
          productPrice: number[];
        };
      };

      // Group products by sellerId
      const productsWithSellerId: GroupedProducts = selectedProducts.reduce(
        (acc: GroupedProducts, product) => {
          const {
            id: productId,
            name: productName,
            ourPrice: productPrice,
            sellerId,
          } = product;

          if (!acc[sellerId]) {
            acc[sellerId] = {
              productId: [],
              productName: [],
              productPrice: [],
            };
          }

          acc[sellerId].productId.push(productId);
          acc[sellerId].productName.push(productName);
          acc[sellerId].productPrice.push(Number(productPrice));

          return acc;
        },
        {}
      );
      const productsWithSellerIdStringify =
        JSON.stringify(productsWithSellerId);

      const { data, status } = await axios.post(
        `/api/${storeId}/stripe/create_payment_intent`,
        {
          // Send metadata to the back end so we can process the payments and payouts after a terminal triggers a webhook
          amount: amountInCents,
          readerId: selectedReader,
          storeId: storeId,
          productIds: selectedProducts.map((product) => product.id),
          productNames: selectedProducts.map((product) => product.name),
          productPrices: selectedProducts.map((product) => product.ourPrice),
          productsWithSellerIdStringify, // Object with sellerId as key and productIds, productNames, productPrices as values
          urlFrom: urlFrom,
          isCash: isCash,
          soldByStaffId: selectedStaffId || `${storeId}`,
          userId: `${selectedUserId}` || "",
          userEmail:
            users.find((user) => user.id === selectedUserId)?.email || "",
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
    const receiptElement = document.createElement("div");

    // Create a root for rendering the component
    const root = createRoot(receiptElement);

    root.render(
      <PrintableReceipt
        storeName={storeName}
        selectedProducts={selectedProducts.map((product) => ({
          ...product,
          ourPrice: Number(product.ourPrice),
        }))}
        total={parseFloat(amount)}
        currencySymbol={currencySymbol}
      />
    );

    const printWindow = window.open("", "_blank");
    printWindow?.document.write("<html><head><title>Print Receipt</title>");
    printWindow?.document.write(
      "<style>body { font-family: Arial, sans-serif; }</style>"
    );
    printWindow?.document.write("</head><body>");
    printWindow?.document.write(receiptElement.innerHTML);
    printWindow?.document.write("</body></html>");
    printWindow?.document.close();

    printWindow?.print();

    // Clean up after rendering
    root.unmount();
  };

  useEffect(() => {
    if (!hasFetchedToken.current) {
      hasFetchedToken.current = true;
      fetchConnectionToken();
      fetchReaders();
    }
  });

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
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const { data } = await axios.get(`/api/${storeId}/staff`);
        setStaffMembers(data);
        // console.log("STAFF from stripe terminal", data[0]);
      } catch (error) {
        console.error("Error fetching staff members:", error);
        toastError("Failed to fetch staff.");
      }
    };
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`/api/${storeId}/users`);
        setUsers(data);
        // console.log("USERS from stripe terminal", data[0]);
      } catch (error) {
        console.error("Error fetching Users :", error);
        toastError("Failed to fetch Users.");
      }
    };

    fetchStaffMembers();
    fetchUsers();
  }, [storeId]);
  console.log("users", users);

  const handleStaffSelect = (value: string) => {
    setSelectedStaffId(value);
  };
  const handleUserSelect = (value: string) => {
    setSelectedUserId(value);
  };

  const handleSearchProductByIDClick = (passedInId: string) => {
    console.log("handleSearchProductByIDClick", passedInId);
    handleSearchById(passedInId);
  };

  return (
    <Card className="w-full md:w-full space-y-4 p-6 md:h-full">
      <CardTitle className="mb-6 text-primary">Point of Sale</CardTitle>
      <div className="flex flex-col w-full md:w-full">
        <div className="flex md:h-full md:w-full items-center justify-center">
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
                    <Card className="w-full  h-[400px]">
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
                        <ScrollArea className="flex-grow ">
                          {searchResults.length > 0 && (
                            <div className="space-y-4">
                              {searchResults.map((result: any) => (
                                <div
                                  key={result.id}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center w-full rounded-md">
                                    {result.images && result.images[0] ? (
                                      <Image
                                        width={80}
                                        height={80}
                                        src={
                                          result.images[0].url ||
                                          "https://stella-ecomm-media-bucket.s3.amazonaws.com/uploads/mobilehome.jpg"
                                        }
                                        alt={result.name}
                                        className="w-20 h-20 object-cover rounded-md p-2"
                                      />
                                    ) : (
                                      <AvatarFallback>
                                        {result?.name?.[0]?.toUpperCase() || ""}
                                        {result?.name?.[1]?.toUpperCase() || ""}
                                      </AvatarFallback>
                                    )}
                                    <div className="flex flex-row gap-2 justify-between text-center items-center w-full">
                                      <div className="flex flex-row gap-2 text-center items-center w-full">
                                        <h3
                                          className="font-semibold hover:cursor-pointer hover:underline text-xs"
                                          onClick={() =>
                                            router.push(
                                              `/${storeId}/products/${result.id}/details`
                                            )
                                          }
                                        >
                                          {result.name}
                                        </h3>
                                        <div className="text-xs text-muted-foreground flex flex-row gap-2">
                                          {currencySymbol}
                                          {result.ourPrice.toString()}
                                          {result.isOnSale && (
                                            <div className="text-muted-foreground line-through">
                                              {currencySymbol}
                                              {result.originalPrice.toString()}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex flex-row gap-2 text-end items-center w-full">
                                        <p
                                          className="text-xs text-muted-foreground w-full mr-4 hover:cursor-pointer hover:underline"
                                          onClick={() =>
                                            router.push(
                                              `/${storeId}/sellers/${result.id}/details`
                                            )
                                          }
                                        >
                                          {result.seller.storeName ||
                                            result.seller.instagramHandle ||
                                            result.seller.firstName}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  {result.seller.stripe_connect_unique_id ? (
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
                                  ) : (
                                    <Button
                                      disabled
                                      className="bg-red-500 text-white cursor-not-allowed"
                                    >
                                      Seller not connected to Stripe
                                    </Button> // TODO: On click set item to stores stripe id that way we can still sell the item but will have to distribute the funds manually
                                  )}
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
                    <Card className="h-[400px]">
                      <CardHeader>
                        <CardTitle>
                          {tab === "category"
                            ? "Categories"
                            : tab.charAt(0).toUpperCase() + tab.slice(1) + "s"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="flex-grow ">
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

            <div className="w-full h-[400px]">
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
                <Card className="w-full h-[400px] mt-[50px]">
                  <CardHeader></CardHeader>
                  <CardContent className="space-y-6">
                    {!isPaymentCaptured ? (
                      <>
                        <div className="flex flex-row gap-2">
                          <Select
                            onValueChange={handleStaffSelect}
                            value={selectedStaffId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Staff member" />
                            </SelectTrigger>
                            <SelectContent>
                              {staffMembers.map((staff) => (
                                <SelectItem key={staff.id} value={staff.id}>
                                  <div className="flex items-center gap-2">
                                    {staff.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            onValueChange={handleUserSelect}
                            value={selectedUserId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Customer account" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  <div className="flex items-center gap-2">
                                    {user.email}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {/* <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              //TODO: Handle create customer account with a dialog
                            }}
                            className="flex-shrink-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button> */}
                          <CreateUserDialog />
                        </div>
                        <Select
                          onValueChange={setSelectedReader}
                          value={selectedReader}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a reader" />
                          </SelectTrigger>
                          <SelectContent>
                            {readers.map((reader) => (
                              <SelectItem key={reader.id} value={reader.id}>
                                <div className="flex items-center justify-between w-full gap-1">
                                  <span>{reader.label}</span>
                                  <Wifi
                                    className={`h-4 w-4 ${
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

                        <Separator />
                        <div className="flex flex-row gap-2 items-center">
                          <Input
                            type="text"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={handleInputChange}
                            className="text-2xl font-bold text-center"
                          />
                          <div className="flex items-center space-x-2  text-muted-foreground">
                            <span>Cash</span>
                            <Switch
                              checked={isCash}
                              onCheckedChange={(checked) => setIsCash(checked)}
                              className="" 
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="text-5xl font-bold text-green-500 mb-4">
                          ✓
                        </div>
                        <p className="text-xl font-semibold">
                          Payment successfully captured!
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    {!isPaymentCaptured ? (
                      <>
                        {!paymentIntentId ? (
                          <Button
                            onClick={() => {
                              if (!selectedStaffId) {
                                toastError("Please select a staff member.");
                              } else {
                                createPendingPayment();
                                setIsDialogOpen(true);
                              }
                            }}
                            disabled={
                              !selectedReader || !amount || !selectedStaffId
                            }
                            className="w-full"
                          >
                            {selectedStaffId
                              ? `Create Payment (${currencySymbol}${amount})`
                              : "Select Staff Member"}
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={cancelPayment}
                              variant="destructive"
                              className="w-full"
                            >
                              Cancel Payment
                            </Button>
                            <Button
                              onClick={() => setIsPaymentCaptured(true)}
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
                        <Button
                          onClick={printReceipt}
                          variant="outline"
                          className="w-full"
                        >
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
                      <div className="w-full justify-center items-center text-center">
                        <Card className="w-full justify-center items-center text-center">
                          <CardHeader>
                            <CardTitle className="text-2xl font-bold justify-center items-center text-center">
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
                                        {currencySymbol}
                                        {Number(product.ourPrice).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                  <Separator />
                                  <div className="flex flex-col p-2">
                                    <div className="flex justify-between">
                                      <span className="text-lg font-bold">
                                        Subtotal
                                      </span>
                                      <span className="text-lg font-bold">
                                        {currencySymbol}
                                        {amount}
                                      </span>
                                    </div>
                                    {/* <div className="flex justify-between">
                                      <span className="text-lg font-bold">
                                        Tax
                                      </span>
                                      <span className="text-lg font-bold">
                                        {currencySymbol}
                                        {taxAmount}
                                      </span>
                                    </div> */}
                                    <Separator />
                                    <div className="flex justify-between">
                                      <span className="text-lg font-bold">
                                        Total
                                      </span>
                                      <span className="text-lg font-bold">
                                        {currencySymbol}
                                        {amount}
                                      </span>
                                    </div>
                                  </div>
                                </ScrollArea>
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
                              Create Payment ({currencySymbol}
                              {amount})
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
                      </div>
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
            <Card className="w-full h-[250px] justify-center items-center text-center">
              <CardHeader>
                <div className="text-2xl font-bold w-full justify-center items-center">
                  Order Summary
                </div>
                <CardContent className="grid gap-4">
                  {selectedProducts.length > 0 && (
                    <>
                      <ScrollArea className="h-[200px] pr-4">
                        {selectedProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex justify-between py-1"
                          >
                            <span className="text-sm text-muted-foreground">
                              {product.name}
                            </span>
                            <span className="text-sm font-medium">
                              {currencySymbol}
                              {Number(product.ourPrice).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex flex-col p-2">
                          <div className="flex justify-between">
                            <span className="text-lg font-bold">Subtotal</span>
                            <span className="text-lg font-bold">
                              {currencySymbol}
                              {amount}
                            </span>
                          </div>
                          {/* <div className="flex justify-between">
                            <span className="text-lg font-bold">Tax</span>
                            <span className="text-lg font-bold">
                              {currencySymbol}
                              {taxAmount}
                            </span>
                          </div> */}
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-lg font-bold">
                              {currencySymbol}
                              {amount}
                            </span>
                          </div>
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <div className="flex justify-center items-center w-full p-2">
            <Card className="w-full h-[80px] justify-center items-center text-center">
              <CardHeader>
                <CardTitle className="text-2xl font-bold justify-center items-center text-center">
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
