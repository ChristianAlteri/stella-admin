import { NextResponse } from 'next/server';


import prismadb from '@/lib/prismadb';
import { convertDecimalFields } from '@/lib/utils';


export async function GET(req: Request) {
    try {
      const url = new URL(req.url);
    const storeId = url.searchParams.get('storeId');

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
      },
      include: {
        address: true,
      },
    });
      // Convert Decimal fields to numbers
      const storeWithConvertedDecimals = convertDecimalFields(store);
  
      return NextResponse.json(storeWithConvertedDecimals);
    } catch (error) {
      console.log('[API_PUBLIC_STORE_GET]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  }