import { stripe } from "@/lib/stripe";
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server"

import prismadb from '@/lib/prismadb';
import { convertDecimalFields } from '@/lib/utils';

export async function POST(req: Request) {

  try {
    const { userId } = auth();
    const body = await req.json();
    console.log("body", body);
    console.log("userId", userId);

    const { name, address, consignmentRate, currency, countryCode } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!address) {
      return new NextResponse("Complete address is required", { status: 400 });
    }

    if (consignmentRate === undefined || consignmentRate < 0 || consignmentRate > 100) {
      return new NextResponse("Valid consignment rate is required", { status: 400 });
    }

    if (!currency) {
      return new NextResponse("Currency is required", { status: 400 });
    }

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
        consignmentRate,
        currency,
        countryCode,
        address: {
          create: {
            ...address
          }
        }
      },
      include: {
        address: true
      }
    });

    const seller = await prismadb.seller.create({
      data: {
        id: store.id, 
        storeId: store.id,
        storeName: store.name,
        firstName: store.name,
        lastName: store.name,
        instagramHandle: store.name,
      }
    });

    const location = await stripe.terminal.locations.create({
      display_name: store.name,
      metadata: {
        storeId: store.id,
      },
      address: {
        line1: address.line1 || " ",
        line2: address.line2 || " ",  
        city: address.city || " ",
        postal_code: address.postalCode || " ",
        country: countryCode || " ", 
        ...(address.state ? { state: address.state } : {}),
      },
    });
  
    console.log("New store created:", store);
    console.log("New seller created:", seller);
    console.log("New location created:", location);
    return NextResponse.json(store);
  } catch (error) {
    console.log('[API_STORES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const url = new URL(req.url);
    const storeId = url.searchParams.get('storeId');

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
      include: {
        address: true,
      },
    });
    console.log("store", store);
    // Convert Decimal fields to numbers
    const storeWithConvertedDecimals = convertDecimalFields(store);
    console.log("storeWithConvertedDecimals", storeWithConvertedDecimals);

    return NextResponse.json(store);
  } catch (error) {
    console.log('[API_STORE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

