import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server"

import prismadb from '@/lib/prismadb';

// export async function POST(
//   req: Request,
// ) {
//   try {
//     const { userId } = auth();
//     const body = await req.json();

//     const { name } = body;

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 403 });
//     }

//     if (!name) {
//       return new NextResponse("Name is required", { status: 400 });
//     }

//     const store = await prismadb.store.create({
//       data: {
//         name,
//         userId,
//       }
//     });
  
//     return NextResponse.json(store);
//   } catch (error) {
//     console.log('[API_STORES_POST]', error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// };

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, address, consignmentRate, currency } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!address || !address.street || !address.city || !address.state || !address.postalCode || !address.country) {
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

    return NextResponse.json(store);
  } catch (error) {
    console.log('[API_STORE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

