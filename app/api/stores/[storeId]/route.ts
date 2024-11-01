import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const logKey = "API_STORES";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    console.group(`[ENTERING_${logKey}_PATCH]`);
    console.log(`%c[INFO] ${logKey}_PATCH body: `, JSON.stringify(body));
    console.groupEnd();

    const {
      name,
      address,
      consignmentRate,
      currency,
      stripe_connect_unique_id,
      countryCode,
      taxRate,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    let addressId = null;

    // If an address is provided, check if the store already has an address
    if (address) {
      const existingAddress = await prismadb.storeAddress.findFirst({
        where: {
          Store: {
            some: {
              id: params.storeId,
            },
          },
        },
      });

      if (existingAddress) {
        // Update the existing address
        const updatedAddress = await prismadb.storeAddress.update({
          where: { id: existingAddress.id },
          data: { ...address },
        });
        addressId = updatedAddress.id;
      } else {
        // Create a new address if none exists
        const newAddress = await prismadb.storeAddress.create({
          data: {
            ...address,
            Store: {
              connect: { id: params.storeId },
            },
          },
        });
        addressId = newAddress.id;
      }
    }

    // Create the update data object and conditionally include fields if they are provided
    const storeData: any = {};
    if (name) storeData.name = name;
    if (consignmentRate) storeData.consignmentRate = consignmentRate;
    if (currency) storeData.currency = currency;
    if (stripe_connect_unique_id)
      storeData.stripe_connect_unique_id = stripe_connect_unique_id;
    if (countryCode) storeData.countryCode = countryCode;
    if (taxRate) storeData.taxRate = taxRate;
    if (addressId) storeData.addressId = addressId;
    console.log(`[INFO] storeData ${logKey}_PATCH`, JSON.stringify(storeData));

    // Update the store with only the fields that were provided
    const store = await prismadb.store.update({
      where: {
        id: params.storeId,
        userId,
      },
      data: storeData,
    });

    const sellerUpdateData: any = {};
    if (name) {
      sellerUpdateData.storeName = name;
      sellerUpdateData.firstName = name; 
      sellerUpdateData.lastName = name; 
    }
    if (stripe_connect_unique_id) {
      sellerUpdateData.stripe_connect_unique_id = stripe_connect_unique_id;
    }
    if (countryCode) {
      sellerUpdateData.country = countryCode;
    }
    console.log(`[INFO] sellerUpdateData ${logKey}_PATCH`, JSON.stringify(sellerUpdateData));

    const seller = await prismadb.seller.update({
      where: {
        storeId: params.storeId,
        id: params.storeId,
      },
      data: sellerUpdateData,
    });

    console.group(`[${logKey}_PATCH]`);
    console.log(`%c[INFO] ${logKey}_PATCH Store: `, store);
    console.log(`%c[INFO] ${logKey}_PATCH Seller: `,seller);
    console.groupEnd();
    return NextResponse.json(store);
  } catch (error) {
    console.log(`[STORE_${logKey}_PATCH]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const store = await prismadb.store.deleteMany({
      where: {
        id: params.storeId,
        userId,
      },
    });
    console.group(`[${logKey}_DELETE]`);
    console.log(`%c[INFO] ${logKey}_DELETE Store: `, store);
    console.groupEnd();
    return NextResponse.json(store);
  } catch (error) {
    console.log(`[${logKey}_DELETE]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
