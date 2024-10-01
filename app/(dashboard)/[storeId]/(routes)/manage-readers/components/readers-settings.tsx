"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Edit,
  PlusCircle,
  Wifi,
  Check,
  X,
  Trash2,
  MapPin,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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

interface Location {
  id: string;
  display_name: string;
}

export default function ReadersSettings() {
  const params = useParams();
  const router = useRouter();
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [registrationCode, setRegistrationCode] = useState<string>("");
  const [readerName, setReaderName] = useState<string>("");
  const [isCreateLocationOpen, setIsCreateLocationOpen] =
    useState<boolean>(false);
  const [newLocation, setNewLocation] = useState({
    displayName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    state: "",
    country: "",
  });

  useEffect(() => {
    const fetchReaders = async () => {
      try {
        const response = await axios.get(
          `/api/${params.storeId}/stripe/readers`
        );
        setReaders(response.data.readers);
      } catch (error) {
        console.error("Error fetching readers:", error);
        setError("Failed to fetch readers");
      } finally {
        setLoading(false);
      }
    };

    fetchReaders();
  }, [params.storeId]);

  const handleEditClick = (reader: Reader) => {
    setEditingId(reader.id);
    setNewLabel(reader.label);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewLabel("");
  };

  const handleCreateReader = async () => {
    if (!selectedLocation || !registrationCode || !readerName) {
      toast.error("Please complete all fields.");
      return;
    }

    try {
      const response = await axios.post(
        `/api/${params.storeId}/stripe/readers`,
        {
          registration_code: registrationCode,
          locationId: selectedLocation.id,
          readerName,
        }
      );

      const newReader = response.data.reader;
      setReaders((prev) => [...prev, newReader]);
      toast.success("Reader created successfully");
    } catch (error) {
      console.error("Error creating reader:", error);
      toast.error("Failed to create reader");
    }
  };

  const handleUpdateLabel = async (readerId: string) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `/api/${params.storeId}/stripe/readers`,
        {
          label: newLabel,
          readerId,
        }
      );
      const updatedReader = response.data.updatedReader;
      setReaders(
        readers.map((reader) =>
          reader.id === readerId ? updatedReader : reader
        )
      );
      setEditingId(null);
      toast.success("Reader label updated successfully");
    } catch (error) {
      console.error("Error updating reader:", error);
      toast.error("Failed to update reader label");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReader = async (readerId: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/stripe/readers`, {
        data: { readerId },
      });
      setReaders(readers.filter((reader) => reader.id !== readerId));
      toast.success("Reader deleted successfully");
    } catch (error) {
      console.error("Error deleting reader:", error);
      toast.error("Failed to delete reader");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await axios.get(
        `/api/${params.storeId}/stripe/locations`
      );
      setLocations(response.data.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to fetch locations");
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleCreateLocation = async () => {
    try {
      // Destructure necessary fields from newLocation and map them to the expected format
      const {
        displayName,
        addressLine1,
        addressLine2,
        city,
        postalCode,
        state,
        country,
      } = newLocation;
      const requestBody = {
        display_name: displayName,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city: city,
        postal_code: postalCode,
        state: state,
        country: country,
      };

      const response = await axios.post(
        `/api/${params.storeId}/stripe/locations`,
        requestBody
      );

      const createdLocation = response.data;
      setLocations([...locations, createdLocation]);
      setIsCreateLocationOpen(false);
      toast.success("Location created successfully");
    } catch (error) {
      console.error("Error creating location:", error);
      const errorMessage =
        (error as any).response?.data?.error || "Failed to create location";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold w-full items-center text-center justify-center">
          Stripe Readers
        </h2>
        <div className="flex gap-4 space-x-4">
          <Button onClick={() => window.open("https://dashboard.stripe.com/terminal/shop", "_blank")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Order a New Reader
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={fetchLocations}>
                <Edit className="mr-2 h-4 w-4" />
                Configure a Reader
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Configure Reader</DialogTitle>
                <DialogDescription>
                  Go to the reader settings and tap Generate pairing code.
                  Select your store&apos;s location and give the reader a name!
                </DialogDescription>
              </DialogHeader>
              {loadingLocations ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div>
                  <div className="space-y-4 mt-4">
                    <Input
                      placeholder="Registration Code"
                      value={registrationCode}
                      onChange={(e) => setRegistrationCode(e.target.value)}
                    />
                    <Input
                      placeholder="Reader Name"
                      value={readerName}
                      onChange={(e) => setReaderName(e.target.value)}
                    />
                    <ul className="space-y-2">
                      <span className="text-sm">Assign a reader to your store</span>
                      {locations.map((location) => (
                        <li
                          key={location.id}
                          className="flex justify-between items-center p-2 hover:bg-gray-200 rounded-lg border"
                        >
                          <span>{location.display_name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedLocation(location)}
                          >
                            Select
                          </Button>
                        </li>
                      ))}
                    </ul>
                    <Button onClick={handleCreateReader}>Create Reader</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {readers.map((reader: Reader) => (
          <Card key={reader.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingId === reader.id ? (
                  <Input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="mr-2"
                  />
                ) : (
                  <span>{reader.label}</span>
                )}
                <Wifi
                  className={`h-5 w-5 ${
                    reader.status === "online"
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium">Device Type:</dt>
                  <dd>{reader.device_type}</dd>
                </div>
                <div>
                  <dt className="font-medium">Last Seen:</dt>
                  <dd>{new Date(reader.last_seen_at).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="font-medium">Serial Number:</dt>
                  <dd>{reader.serial_number}</dd>
                </div>
                <div>
                  <dt className="font-medium">Status:</dt>
                  <dd
                    className={`capitalize ${
                      reader.status === "online"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {reader.status}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Mode:</dt>
                  <dd>{reader.livemode ? "Live" : "Test"}</dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter>
              {editingId === reader.id ? (
                <div className="flex w-full space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleUpdateLabel(reader.id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleCancelEdit}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex w-full space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(reader)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Label
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteReader(reader.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <Separator />
      <div>
        {/* TODO: list locations and make above overflow-auto */}
      <Dialog
            open={isCreateLocationOpen}
            onOpenChange={setIsCreateLocationOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <MapPin className="mr-2 h-4 w-4" />
                Create Location
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Location</DialogTitle>
                <DialogDescription>
                  Enter the details for your new location.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Select
                  value={newLocation.country}
                  onValueChange={(value) =>
                    setNewLocation({ ...newLocation, country: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AU">Australia (AU)</SelectItem>
                    <SelectItem value="GB">United Kingdom (GB)</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Address Line 1"
                  value={newLocation.addressLine1}
                  onChange={(e) =>
                    setNewLocation({
                      ...newLocation,
                      addressLine1: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Address Line 2"
                  value={newLocation.addressLine2}
                  onChange={(e) =>
                    setNewLocation({
                      ...newLocation,
                      addressLine2: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="City"
                  value={newLocation.city}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, city: e.target.value })
                  }
                />
                <Input
                  placeholder="Postal Code"
                  value={newLocation.postalCode}
                  onChange={(e) =>
                    setNewLocation({
                      ...newLocation,
                      postalCode: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="State"
                  value={newLocation.state}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, state: e.target.value })
                  }
                />
                <Input
                  placeholder="Display Name"
                  value={newLocation.displayName}
                  onChange={(e) =>
                    setNewLocation({
                      ...newLocation,
                      displayName: e.target.value,
                    })
                  }
                />
                <Button onClick={handleCreateLocation}>Create Location</Button>
              </div>
            </DialogContent>
          </Dialog>
      </div>
    </div>
  );
}
// "use client";

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   AlertCircle,
//   Edit,
//   PlusCircle,
//   Wifi,
//   Check,
//   X,
//   Trash2,
// } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Input } from "@/components/ui/input";
// import toast from "react-hot-toast";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// interface Reader {
//   id: string;
//   object: string;
//   action: {
//     failure_code: string | null;
//     failure_message: string | null;
//     process_payment_intent: Record<string, unknown>;
//     status: string;
//     type: string;
//   };
//   device_sw_version: string;
//   device_type: string;
//   ip_address: string;
//   label: string;
//   last_seen_at: number;
//   livemode: boolean;
//   location: string;
//   metadata: Record<string, unknown>;
//   serial_number: string;
//   status: string;
// }

// interface Location {
//   id: string;
//   display_name: string;
// }

// export default function ReadersSettings() {
//   const params = useParams();
//   const [readers, setReaders] = useState<Reader[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [newLabel, setNewLabel] = useState<string>("");
//   const [locations, setLocations] = useState<Location[]>([]);
//   const [loadingLocations, setLoadingLocations] = useState<boolean>(false);
//   const [selectedLocation, setSelectedLocation] = useState<Location | null>(
//     null
//   );
//   const [registrationCode, setRegistrationCode] = useState<string>("");
//   const [readerName, setReaderName] = useState<string>("");

//   useEffect(() => {
//     const fetchReaders = async () => {
//       try {
//         const response = await axios.get(
//           `/api/${params.storeId}/stripe/readers`
//         );
//         setReaders(response.data.readers);
//       } catch (error) {
//         console.error("Error fetching readers:", error);
//         setError("Failed to fetch readers");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReaders();
//   }, [params.storeId]);

//   const handleEditClick = (reader: Reader) => {
//     setEditingId(reader.id);
//     setNewLabel(reader.label);
//   };

//   const handleCancelEdit = () => {
//     setEditingId(null);
//     setNewLabel("");
//   };

//   const handleCreateReader = async () => {
//     if (!selectedLocation || !registrationCode || !readerName) {
//       toast.error("Please complete all fields.");
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `/api/${params.storeId}/stripe/readers`,
//         {
//           registration_code: registrationCode,
//           locationId: selectedLocation.id,
//           readerName,
//         }
//       );

//       const newReader = response.data.reader;
//       setReaders((prev) => [...prev, newReader]);
//       toast.success("Reader created successfully");
//     } catch (error) {
//       console.error("Error creating reader:", error);
//       toast.error("Failed to create reader");
//     }
//   };

//   const handleUpdateLabel = async (readerId: string) => {
//     try {
//       setLoading(true);
//       const response = await axios.patch(
//         `/api/${params.storeId}/stripe/readers`,
//         {
//           label: newLabel,
//           readerId,
//         }
//       );
//       const updatedReader = response.data.updatedReader;
//       setReaders(
//         readers.map((reader) =>
//           reader.id === readerId ? updatedReader : reader
//         )
//       );
//       setEditingId(null);
//       toast.success("Reader label updated successfully");
//     } catch (error) {
//       console.error("Error updating reader:", error);
//       toast.error("Failed to update reader label");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteReader = async (readerId: string) => {
//     try {
//       setLoading(true);
//       await axios.delete(`/api/${params.storeId}/stripe/readers`, {
//         data: { readerId },
//       });
//       setReaders(readers.filter((reader) => reader.id !== readerId));
//       toast.success("Reader deleted successfully");
//     } catch (error) {
//       console.error("Error deleting reader:", error);
//       toast.error("Failed to delete reader");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchLocations = async () => {
//     setLoadingLocations(true);
//     try {
//       const response = await axios.get(
//         `/api/${params.storeId}/stripe/locations`
//       );
//       setLocations(response.data.data);
//     } catch (error) {
//       console.error("Error fetching locations:", error);
//       toast.error("Failed to fetch locations");
//     } finally {
//       setLoadingLocations(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="space-y-4">
//         <Skeleton className="h-8 w-[250px]" />
//         <Skeleton className="h-[400px] w-full" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <Alert variant="destructive">
//         <AlertCircle className="h-4 w-4" />
//         <AlertTitle>Error</AlertTitle>
//         <AlertDescription>{error}</AlertDescription>
//       </Alert>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col">
//         <h2 className="text-2xl font-bold w-full items-center text-center justify-center">
//           Stripe Readers
//         </h2>
//         <div className="flex gap-4 space-x-4">
//           <Button>
//             <PlusCircle className="mr-2 h-4 w-4" />
//             Order a New Reader
//           </Button>
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button variant="outline" onClick={fetchLocations}>
//                 <Edit className="mr-2 h-4 w-4" />
//                 Configure a Reader
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[425px]">
//               <DialogHeader>
//                 <DialogTitle>Configure Reader</DialogTitle>
//                 <DialogDescription>
//                   Go to the reader settings and tap Generate pairing code.
//                   Select your stores location and give the reader a name!
//                 </DialogDescription>
//               </DialogHeader>
//               {loadingLocations ? (
//                 <div className="space-y-2">
//                   <Skeleton className="h-4 w-full" />
//                   <Skeleton className="h-4 w-full" />
//                   <Skeleton className="h-4 w-full" />
//                 </div>
//               ) : (
//                 <div>
//                   <div className="space-y-4 mt-4">
//                     <Input
//                       placeholder="Registration Code"
//                       value={registrationCode}
//                       onChange={(e) => setRegistrationCode(e.target.value)}
//                     />
//                     <Input
//                       placeholder="Reader Name"
//                       value={readerName}
//                       onChange={(e) => setReaderName(e.target.value)}
//                     />
//                     <ul className="space-y-2">
//                       {locations.map((location) => (
//                         <li
//                           key={location.id}
//                           className="flex justify-between items-center p-2 hover:bg-gray-200 rounded-lg border"
//                         >
//                           <span>{location.display_name}</span>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => setSelectedLocation(location)}
//                           >
//                             Select
//                           </Button>
//                         </li>
//                       ))}
//                     </ul>
//                     <Button onClick={handleCreateReader}>Create Reader</Button>
//                   </div>
//                 </div>
//               )}
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {readers.map((reader: Reader) => (
//           <Card key={reader.id}>
//             <CardHeader>
//               <CardTitle className="flex items-center justify-between">
//                 {editingId === reader.id ? (
//                   <Input
//                     value={newLabel}
//                     onChange={(e) => setNewLabel(e.target.value)}
//                     className="mr-2"
//                   />
//                 ) : (
//                   <span>{reader.label}</span>
//                 )}
//                 <Wifi
//                   className={`h-5 w-5 ${
//                     reader.status === "online"
//                       ? "text-green-500"
//                       : "text-gray-300"
//                   }`}
//                 />
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <dl className="space-y-2 text-sm">
//                 <div>
//                   <dt className="font-medium">Device Type:</dt>
//                   <dd>{reader.device_type}</dd>
//                 </div>
//                 <div>
//                   <dt className="font-medium">Last Seen:</dt>
//                   <dd>{new Date(reader.last_seen_at).toLocaleString()}</dd>
//                 </div>
//                 <div>
//                   <dt className="font-medium">Serial Number:</dt>
//                   <dd>{reader.serial_number}</dd>
//                 </div>
//                 <div>
//                   <dt className="font-medium">Status:</dt>
//                   <dd
//                     className={`capitalize ${
//                       reader.status === "online"
//                         ? "text-green-600"
//                         : "text-red-600"
//                     }`}
//                   >
//                     {reader.status}
//                   </dd>
//                 </div>
//                 <div>
//                   <dt className="font-medium">Mode:</dt>
//                   <dd>{reader.livemode ? "Live" : "Test"}</dd>
//                 </div>
//               </dl>
//             </CardContent>
//             <CardFooter>
//               {editingId === reader.id ? (
//                 <div className="flex w-full space-x-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     className="flex-1"
//                     onClick={() => handleUpdateLabel(reader.id)}
//                   >
//                     <Check className="mr-2 h-4 w-4" />
//                     Save
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     className="flex-1"
//                     onClick={handleCancelEdit}
//                   >
//                     <X className="mr-2 h-4 w-4" />
//                     Cancel
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="flex w-full space-x-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     className="flex-1"
//                     onClick={() => handleEditClick(reader)}
//                   >
//                     <Edit className="mr-2 h-4 w-4" />
//                     Edit Label
//                   </Button>
//                   <Button
//                     variant="destructive"
//                     size="sm"
//                     className="flex-1"
//                     onClick={() => handleDeleteReader(reader.id)}
//                   >
//                     <Trash2 className="mr-2 h-4 w-4" />
//                     Delete
//                   </Button>
//                 </div>
//               )}
//             </CardFooter>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }
