import prismadb from "@/lib/prismadb";
import { convertDecimalFields } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const logKey = "API_COMPANY";

export async function PATCH(
  req: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    console.group(`[ENTERING_${logKey}_PATCH]`);
    console.log(`%c[INFO] ${logKey}_PATCH body: `, JSON.stringify(body));
    console.groupEnd();

    const {
      name,
      adminEmail
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.companyId) {
      return new NextResponse("Company id is required", { status: 400 });
    }

    // Create the update data object and conditionally include fields if they are provided
    const companyData: any = {};
    if (name) companyData.name = name;
    if (adminEmail) companyData.adminEmail = adminEmail;

    console.log(`[INFO] companyData ${logKey}_PATCH`, JSON.stringify(companyData));

    // Update the store with only the fields that were provided
    const company = await prismadb.company.update({
      where: {
        id: params.companyId,
        userId,
      },
      data: companyData,
    });


    console.group(`[${logKey}_PATCH]`);
    console.log(`%c[INFO] ${logKey}_PATCH company: `, company);
    console.groupEnd();
    return NextResponse.json(company);
  } catch (error) {
    console.log(`[STORE_${logKey}_PATCH]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.companyId) {
      return new NextResponse("company id is required", { status: 400 });
    }

    const company = await prismadb.company.deleteMany({
      where: {
        id: params.companyId,
        userId,
      },
    });
    console.group(`[${logKey}_DELETE]`);
    console.log(`%c[INFO] ${logKey}_DELETE company: `, company);
    console.groupEnd();
    return NextResponse.json(company);
  } catch (error) {
    console.log(`[${logKey}_DELETE]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

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
    console.log('[API_STORE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}