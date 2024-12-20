import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { formatNameToSlug } from "@/lib/utils";

const logKey = "API_COMPANY";

export async function POST(req: Request) {
  try {
    console.log(`[ENTERING_${logKey}_POST]`);
    const { userId } = auth();
    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const nameFormatted = formatNameToSlug(name);

    const company = await prismadb.company.create({
      data: {
        name: nameFormatted,
        userId,
      },
    });

    console.log(`[${logKey}_POST Created company: `, company);
    return NextResponse.json(company);
  } catch (error) {
    console.log(`[${logKey}_POST]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const url = new URL(req.url);
    const companyName = url.searchParams.get("companyName");
    console.group(`[ENTERING_${logKey}_GET]`);
    console.log(`%c[INFO] ${logKey}_GET url: `, url);
    console.log(`%c[INFO] ${logKey}_GET companyName: `, companyName);
    console.groupEnd();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!companyName) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const company = await prismadb.company.findFirst({
      where: {
        name: companyName,
        userId,
      },
    });

    console.log("%c[INFO] company Get: ", company);

    return NextResponse.json(company);
  } catch (error) {
    console.log("[API_STORE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
