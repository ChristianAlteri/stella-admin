import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const locations = await stripe.terminal.locations.list({
      limit: 8,
    });
    // console.log("locations", locations);
    return NextResponse.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
    const data: { [key: string]: string } = await req.json();
  
    try {
      // Filter out any empty or undefined values from the data
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value && value.trim() !== "")
      );
  
      // Create a new terminal location with the cleaned data
      const location = await stripe.terminal.locations.create({
        display_name: filteredData.display_name,
        metadata: {
          storeId: filteredData.store_id,
        },
        address: {
          line1: filteredData.address_line1,
          line2: filteredData.address_line2,  
          city: filteredData.city,
          postal_code: filteredData.postal_code,
          state: filteredData.state,
          country: filteredData.country,
        },
      });
  
      console.log("New location created:", location);
  
      // Return the created location
      return NextResponse.json(location);
    } catch (error) {
      console.error("Error creating or fetching locations:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
  
  export async function DELETE(req: NextRequest) {
    const data: { locationId: string } = await req.json();
  
    try {
      const { locationId } = data;
  
      // Delete the terminal location using the provided locationId
      const deletedLocation = await stripe.terminal.locations.del(locationId);
  
      console.log("Location deleted:", deletedLocation);
      return NextResponse.json({ success: true, deletedLocation });
    } catch (error) {
      console.error("Error deleting location:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }