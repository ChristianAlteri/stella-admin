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
  livemode: boolean;
  metadata: Record<string, unknown>;
  address: {
    city: string;
    country: string;
    line1: string;
    line2: string;
    postal_code: string;
    state: string;
  };
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
  const [readerBeingEdited, setReaderBeingEdited] = useState<string | null>(
    null
  );
  const [isEditLocationOpen, setIsEditLocationOpen] = useState<boolean>(false);
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

  const openEditLocationDialog = (readerId: string) => {
    setReaderBeingEdited(readerId);
    setIsEditLocationOpen(true);
  };

  const closeEditLocationDialog = () => {
    setReaderBeingEdited(null);
    setIsEditLocationOpen(false);
  };

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
    fetchReaders();
    fetchLocations();
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
        store_id: params.storeId,
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
    <>
      <Card className="space-y-6 p-6">
        <div className="flex flex-row ">
          <div className="flex flex-col gap-1 w-full">
            <h2 className="text-primary items-start text-2xl font-bold w-full text-start justify-start underline">
              Stripe Readers
            </h2>
            <h6 className="opacity-30 text-xs items-start text-start justify-start ">
              Admin pin: 07139
            </h6>
          </div>
          <div className="flex gap-4 space-x-4">
            <Button
              onClick={() =>
                window.open(
                  "https://dashboard.stripe.com/terminal/shop",
                  "_blank"
                )
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Order a New Reader
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Configure a Reader
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Configure Reader</DialogTitle>
                  <DialogDescription>
                    Swipe right to the reader settings and tap Generate pairing
                    code. Select your store&apos;s location and give the reader
                    a name!
                    <h6 className=" text-xs">
                      If you&apos;re having trouble configuring, go here:{" "}
                      <a
                        href="https://docs.stripe.com/terminal/payments/setup-reader/bbpos-wisepos-e"
                        target="_blank"
                      >
                        <h6 className="text-blue-500 hover:underline">
                          Stripe Reader Setup Guide
                        </h6>
                      </a>
                    </h6>
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
                    <div className="gap-4 h-full flex flex-col">
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
                        <span className="text-sm">
                          Assign a reader to a location
                        </span>
                        {locations.map((location) => (
                          <li
                            key={location.id}
                            className={`flex justify-between items-center p-2 rounded-lg border 
                            ${
                              selectedLocation?.id === location.id
                                ? "bg-primary border-primary"
                                : "hover:bg-muted hover:cursor-pointer"
                            }`}
                          >
                            <span>{location.display_name}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedLocation(location)}
                            >
                              {selectedLocation?.id === location.id
                                ? "Selected"
                                : "Select"}
                            </Button>
                          </li>
                        ))}
                      </ul>
                      <Button onClick={handleCreateReader}>
                        Create Reader
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 w-full">
          {readers.map((reader: Reader) => (
            <Card key={reader.id} className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-muted-foreground">
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
                    <div className="flex flex-row gap-1 w-full">
                      <dt className="font-medium text-primary">Location:</dt>
                      <dd className="text-muted-foreground w-full">
                        {locations.find((loc) => loc.id === reader.location)
                          ?.display_name || "Unknown Location"}
                      </dd>
                      <div
                        className="hover:underline hover:cursor-pointer justify-end w-full text-end"
                        onClick={() => openEditLocationDialog(reader.id)}
                      >
                        Edit
                      </div>
                    </div>
                  </div>
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
      </Card>

      <Card className="space-y-6 p-6">
        <div className="">
          <div className="flex flex-row justify-between w-full">
            <h2 className="text-primary justify-start items-start text-start text-2xl font-bold w-full underline mb-4">
              Locations
            </h2>

            <Dialog
              open={isCreateLocationOpen}
              onOpenChange={setIsCreateLocationOpen}
            >
              <DialogTrigger asChild>
                <Button variant="default">
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
                  <Button onClick={handleCreateLocation}>
                    Create Location
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 w-full mt-4">
            {locations.map((location) => (
              <Card key={location.id} className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-muted-foreground">
                    <span>{location.display_name}</span>
                    <MapPin className="h-5 w-5 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium">ID:</dt>
                      <dd>{location.id}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Address:</dt>
                      <dd>{location?.address.line1}</dd>
                      {location.address?.line2 && (
                        <dd>{location.address.line2}</dd>
                      )}
                      <dd>{`${location.address?.city}, ${location.address?.state} ${location.address?.postal_code}`}</dd>
                      <dd>{location.address?.country}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <Dialog open={isEditLocationOpen} onOpenChange={setIsEditLocationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Reader&apos;s Location</DialogTitle>
            <DialogDescription>
              To change the location of this reader, you must first delete the
              reader and then re-register it with the new location. Please
              follow these steps:
              <ol className="list-decimal ml-5 mt-2">
                <li>
                  Click the <strong>Delete</strong> button to remove this
                  reader.
                </li>
                <li>
                  After deletion, click <strong>Configure a Reader</strong> to
                  re-register it with the new location.
                </li>
              </ol>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4 gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteReader(readerBeingEdited as string);
                closeEditLocationDialog(); 
              }}
            >
              Delete Reader
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
