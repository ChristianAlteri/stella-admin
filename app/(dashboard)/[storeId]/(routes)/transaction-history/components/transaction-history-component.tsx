"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp, PrinterIcon, PackageIcon } from "lucide-react";
import { User } from "@prisma/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionHistoryColumn } from "./columns";
import { useParams, useRouter } from "next/navigation";
import { currencyConvertor, formatAddress } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import axios from "axios";
import DispatchOrderDialog from "./dispatch-order-dialog";
import toast from "react-hot-toast";
import { TbFaceId, TbFaceIdError } from "react-icons/tb";

interface TransactionHistoryComponentProps {
  data: TransactionHistoryColumn;
}

export default function TransactionHistoryComponent({
  data,
}: TransactionHistoryComponentProps) {
  const currencySymbol = currencyConvertor(data.countryCode);
  const router = useRouter();
  const params = useParams();
  const [isMinimized, setIsMinimized] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
  toast.error(message, {
    style: {
      background: "white",
      color: "green",
    },
    icon: <TbFaceId size={30} />,
  });
};

  const handleDispatchSuccess = () => {
    // TODO: Refresh data or update state as needed
    toastSuccess('Order successfully dispatched.');
    window.location.reload();
  };

  const openModal = (imageUrl: any) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (data.order?.userId) {
        try {
          const response = await axios.get(
            `/api/${params.storeId}/users/${data.order.userId}`
          );
          console.log("Fetched User:", response.data);
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        {isMinimized ? (
          <div className="flex flex-row items-center justify-between bg-white rounded-lg shadow-sm hover:shadow-md">
            <div className="grid grid-cols-9 w-full items-center ml-3">
              <h3 className="font-semibold text-xs col-span-1 truncate">
                {currencySymbol}
                {data.order?.totalAmount?.toFixed(2)}
                <p className="flex text-xs text-muted-foreground truncate">
                  After Fees: {currencySymbol}
                  {data.order?.Payout?.reduce(
                    (acc, payout) => acc + payout.amount,
                    0
                  ).toFixed(2)}
                </p>
              </h3>
              <p className="font-semibold text-xs col-span-1 text-left truncate flex items-center">
                {data.order && data.order.orderItems?.length > 0 && (
                  <>
                    <span className="truncate">
                      {data.order.orderItems[0].product.name}
                    </span>
                    {data.order.orderItems.length > 1 && (
                      <span className="ml-2 text-xs text-muted-foreground truncate">
                        + {data.order.orderItems.length - 1}
                      </span>
                    )}
                  </>
                )}
              </p>
              <p className="font-semibold text-xs col-span-1 text-left truncate flex items-center">
                {data.order && data.order.orderItems?.length > 0 && (
                  <>
                    <span
                      onClick={() =>
                        router.push(
                          `/${params.storeId}/sellers/${data?.order?.orderItems[0].product.seller.id}/details`
                        )
                      }
                      className="cursor-pointer text-blue-500 hover:underline"
                    >
                      {data.order.orderItems[0].product.seller.storeName}
                    </span>
                    {data.order.orderItems.length > 1 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        + {data.order.orderItems.length - 1}
                      </span>
                    )}
                  </>
                )}
              </p>

              <div className="payout-details col-span-1">
                {data.order &&
                data.order.Payout &&
                data.order.Payout.length > 0 ? (
                  <p className="text-xs flex items-center">
                    <span className="truncate flex flex-row">
                      <span className="ml-1">
                        {currencySymbol}
                        {data.order.Payout[0].amount.toFixed(2)}
                      </span>
                      <span className="text-blue-500 hover:underline ml-2">
                        {data.order.Payout[0].stripeTransferId
                          ? `${data.order.Payout[0].stripeTransferId[0]?.toUpperCase()}${data.order.Payout[0].stripeTransferId[1]?.toUpperCase()}`
                          : "N/A"}
                      </span>
                    </span>
                    {data.order.Payout.length > 1 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        + {data.order.Payout.length - 1}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs ">No payout details</p>
                )}
              </div>

              <h3 className="font-semibold text-xs col-span-1 truncate">
                {data.order?.soldByStaff
                  ? typeof data.order.soldByStaff === "string"
                    ? data.order.soldByStaff
                    : data.order.soldByStaff.name
                  : "No staff details"}
              </h3>

              <h3
                className="font-semibold text-xs col-span-1 truncate hover:underline hover:cursor-pointer"
                onClick={() =>
                  router.push(`/${params.storeId}/users/${user?.id}/details`)
                }
              >
                {user ? user?.name : "No customer details"}
              </h3>

              <h3 className="font-semibold text-xs col-span-1 truncate">
                {data.order?.inStoreSale
                  ? "In Store Sale"
                  : data.order?.hasBeenDispatched &&
                    data.order?.inStoreSale === false
                  ? "Dispatched"
                  : "Unfulfilled"}
              </h3>

              <p className="text-sm text-muted-foreground col-span-1 truncate">
                {data.order?.createdAt
                  ? new Date(data.order.createdAt).toLocaleString("en-GB", {
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </p>
              <div className="flex items-center justify-center p-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:cursor-pointer focus:outline-none focus:ring-2 m-2 p-1"
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <Card className="w-full overflow-hidden transition-all duration-300 ease-in-out">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <CardTitle className="text-2xl font-bold mb-2">
                      Gross Sale: {currencySymbol}
                      {data.order?.totalAmount?.toFixed(2)}
                      <p className="flex text-xs text-muted-foreground">
                        After fees: {currencySymbol}{" "}
                        {data.order?.Payout?.reduce(
                          (acc, payout) => acc + payout.amount,
                          0
                        ).toFixed(2)}
                      </p>
                    </CardTitle>
                    <p className="flex text-muted-foreground text-xs">
                      {data.order?.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:cursor-pointer focus:outline-none focus:ring-2 m-2 p-1"
                >
                  {isMinimized ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </CardHeader>
              <CardContent
                className={`space-y-6 ${isMinimized ? "hidden" : ""}`}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {data.order?.orderItems?.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center space-y-2"
                    >
                      {item.product.images &&
                        item.product.images.length > 0 && (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            width={100}
                            height={100}
                            className="rounded-md object-cover shadow-md hover:shadow-lg transition-shadow duration-300"
                            onClick={() => openModal(item.product.images[0].url)}
                          />
                        )}
                      <p
                        className="text-center font-semibold text-sm truncate max-w-[100px] cursor-pointer hover:text-primary transition-colors duration-300"
                        onClick={() =>
                          router.push(
                            `/${params.storeId}/products/${item.product.id}/details`
                          )
                        }
                      >
                        {item.product.name}
                      </p>
                      <span
                        onClick={() =>
                          router.push(
                            `/${params.storeId}/sellers/${item.product.seller.id}/details`
                          )
                        }
                        className="cursor-pointer text-blue-500 hover:text-blue-700 font-medium text-xs truncate max-w-[100px]"
                      >
                        {item.product.seller?.storeName}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Modal */}
                {isModalOpen && selectedImage && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={closeModal} 
                  >
                    <div
                      className="relative"
                      onClick={(e) => e.stopPropagation()} 
                    >
                      <Image
                        src={selectedImage}
                        alt="Enlarged"
                        width={600}
                        height={600}
                        className="rounded-md shadow-lg"
                      />
                      <button
                        className="absolute top-2 right-2 text-white bg-black bg-opacity-70 rounded-full px-2 py-1"
                        onClick={closeModal}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="">
                    <div>
                      <h3 className="font-semibold text-sm">Payout Details</h3>
                    </div>
                    {data.order?.Payout && data.order.Payout.length > 0 ? (
                      data.order.Payout.map((payout, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-start p-1"
                        >
                          {/* TODO: change schema to hold seller.storeName inside the payout modal */}
                          <p className="text-xs text-blue-500 hover:underline">
                            {payout.stripeTransferId
                              ? `${payout.stripeTransferId}`
                              : "N/A"}
                          </p>
                          {/* Payout Amount */}
                          <p className="text-xs">
                            {currencySymbol}
                            <span className="">{payout.amount.toFixed(2)}</span>
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm">No payout details</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs">Customer</h3>
                    <p
                      className="font-semibold text-xs col-span-1 truncate text-muted-foreground hover:underline hover:cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/${params.storeId}/users/${user?.id}/details`
                        )
                      }
                    >
                      {user ? user?.name : "No customer details"}
                    </p>
                    <h3 className="font-semibold text-black text-xs">
                      Shipping Address
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {data?.order?.address
                        ? formatAddress(data?.order?.address)
                        : "N/A"}
                    </p>
                    <h3 className="font-semibold text-black text-xs">Email</h3>
                    <p className="text-xs text-muted-foreground">
                      {data?.order?.email || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs">Dispatch Status</h3>
                    <p className="font-semibold text-xs col-span-1 truncate">
                      {data.order?.inStoreSale
                        ? "In Store Sale"
                        : data.order?.hasBeenDispatched &&
                          data.order?.inStoreSale === false
                        ? "Dispatched"
                        : "Unfulfilled"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs">Order Date</h3>
                    <p className="text-xs text-muted-foreground">
                      {data.order?.createdAt
                        ? new Date(data.order.createdAt).toLocaleString(
                            "en-GB",
                            {
                              year: "2-digit",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  {/* <Button variant="outline" size="sm">
                    <PrinterIcon className="mr-2 h-4 w-4" />
                    Print Shipping Label
                  </Button> */}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsDispatchDialogOpen(true)}
                  >
                    <PackageIcon className="mr-2 h-4 w-4" />
                    Dispatch Order
                  </Button>
                  {isDispatchDialogOpen && (
                    <DispatchOrderDialog
                      orderId={data.order?.id!}
                      address={data.order?.address!}
                      email={data.order?.email!}
                      storeId={Array.isArray(params.storeId) ? params.storeId[0] : params.storeId}
                      onClose={() => setIsDispatchDialogOpen(false)}
                      onDispatched={handleDispatchSuccess}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
