import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const readers = await stripe.terminal.readers.list();
    // console.log("readers", readers.data);
    return NextResponse.json({ readers: readers.data });
  } catch (error) {
    console.error("Error creating listing readers:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

// export async function PATCH(req: NextRequest) {
//   try {
//     const { label, readerId, locationId } = await req.json();

//     // if locationId then we need to update the location of the reader

//     const updatedReader = await stripe.terminal.readers.update(readerId, {
//       label,
//     });

//     return NextResponse.json({ updatedReader });
//   } catch (error) {
//     console.error("Error updating reader:", error);
//     return NextResponse.json(
//       { error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

export async function PATCH(req: NextRequest) {
  try {
    const { readerId, locationId, label } = await req.json();


    // Update the reader's location if locationId is provided
    const updateData: any = {};

    if (locationId) {
      updateData.location = locationId;
    }
    
    if (label) {
      updateData.label = label;
    }

    // Update the reader in Stripe Terminal
    const updatedReader = await stripe.terminal.readers.update(readerId, updateData);
    console.log("updatedReader", updatedReader, { readerId, locationId, label });

    return NextResponse.json({ updatedReader });
  } catch (error) {
    console.error("Error updating reader:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const { readerId } = await req.json(); 

    const deleted = await stripe.terminal.readers.del(readerId);

    return NextResponse.json({ deleted });
  } catch (error) {
    console.error("Error deleting reader:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { registration_code, locationId, readerName } = await req.json();

    const reader = await stripe.terminal.readers.create({
      label: readerName,
      registration_code,
      location: locationId,
    });

    return NextResponse.json({ reader });
  } catch (error) {
    console.error("Error creating reader:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
