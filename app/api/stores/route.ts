import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";
import { convertDecimalFields } from "@/lib/utils";

const logKey = "API_STORES";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    console.group(`[ENTERING_${logKey}_POST]`);
    console.log(`%c[INFO] ${logKey}_POST body: `, JSON.stringify(body));
    console.groupEnd();

    const { name, address, consignmentRate, currency, countryCode, taxRate } =
      body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const company = await prismadb.company.findFirst({
      where: {
        userId,
      },
    });

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!address) {
      return new NextResponse("Complete address is required", { status: 400 });
    }

    if (
      consignmentRate === undefined ||
      consignmentRate < 0 ||
      consignmentRate > 100
    ) {
      return new NextResponse("Valid consignment rate is required", {
        status: 400,
      });
    }

    if (!currency) {
      return new NextResponse("Currency is required", { status: 400 });
    }

    if (!company) {
      return new NextResponse("Company not found", { status: 404 });
    }

    const store = await prismadb.store.create({
      data: {
        company: { connect: { id: company.id } },
        name,
        userId,
        consignmentRate,
        currency,
        countryCode,
        taxRate,
        address: {
          create: {
            ...address,
          },
        },
      },
      include: {
        address: true,
      },
    });

    const seller = await prismadb.seller.create({
      data: {
        id: store.id,
        storeId: store.id,
        storeName: store.name,
        firstName: store.name,
        lastName: store.name,
        instagramHandle: store.name,
      },
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

    const defaultStaff = await prismadb.staff.create({
      data: {
        id: store.id,
        storeId: store.id,
        name: store.name,
        staffType: "Store",
      },
    });

    console.log("[INFO] Default Staff Created:", defaultStaff);

    // TODO: add all the fields as a part of the store creation
    // Make sure its different if the seller selects clothing, art dealer or furniture
    const sizes = await prismadb.size.createMany({
      data: [
        { name: "XXS", storeId: store.id },
        { name: "XS", storeId: store.id },
        { name: "S", storeId: store.id },
        { name: "M", storeId: store.id },
        { name: "L", storeId: store.id },
        { name: "XL", storeId: store.id },
        { name: "XXL", storeId: store.id },
        { name: "XXXL", storeId: store.id },
        { name: "AU/UK 6", storeId: store.id },
        { name: "AU/UK 8", storeId: store.id },
        { name: "AU/UK 10", storeId: store.id },
        { name: "AU/UK 12", storeId: store.id },
        { name: "AU/UK 14", storeId: store.id },
        { name: "AU/UK 16", storeId: store.id },
        { name: "AU/UK 18", storeId: store.id },
        { name: "IT 38", storeId: store.id },
        { name: "IT 40", storeId: store.id },
        { name: "IT 42", storeId: store.id },
        { name: "IT 44", storeId: store.id },
        { name: "IT 46", storeId: store.id },
        { name: "FR 34", storeId: store.id },
        { name: "FR 36", storeId: store.id },
        { name: "FR 38", storeId: store.id },
        { name: "FR 40", storeId: store.id },
        { name: "FR 42", storeId: store.id },
        { name: "EU 35", storeId: store.id },
        { name: "EU 36", storeId: store.id },
        { name: "EU 37", storeId: store.id },
        { name: "EU 38", storeId: store.id },
        { name: "EU 39", storeId: store.id },
        { name: "EU 40", storeId: store.id },
        { name: "EU 41", storeId: store.id },
        { name: "EU 42", storeId: store.id },
        { name: "EU 43", storeId: store.id },
        { name: "EU 44", storeId: store.id },
        { name: "EU 45", storeId: store.id },
        { name: "EU 46", storeId: store.id },
        { name: "W24", storeId: store.id },
        { name: "W25", storeId: store.id },
        { name: "W26", storeId: store.id },
        { name: "W27", storeId: store.id },
        { name: "W28", storeId: store.id },
        { name: "W29", storeId: store.id },
        { name: "W30", storeId: store.id },
        { name: "W31", storeId: store.id },
        { name: "W32", storeId: store.id },
        { name: "W33", storeId: store.id },
        { name: "W34", storeId: store.id },
        { name: "W35", storeId: store.id },
        { name: "W36", storeId: store.id },
        { name: "W37", storeId: store.id },
        { name: "W38", storeId: store.id },
        { name: "W39", storeId: store.id },
        { name: "W40", storeId: store.id },
        { name: "ONE SIZE", storeId: store.id },
        { name: "N/A", storeId: store.id },
      ],
    });

    const genders = await prismadb.gender.createMany({
      data: [
        { name: "MENS", storeId: store.id },
        { name: "WOMEN'S", storeId: store.id },
      ],
    });

    const colors = await prismadb.color.createMany({
      data: [
        { name: "BLACK", storeId: store.id },
        { name: "BLUE", storeId: store.id },
        { name: "BROWN", storeId: store.id },
        { name: "BURGUNDY", storeId: store.id },
        { name: "CREAM", storeId: store.id },
        { name: "GOLD", storeId: store.id },
        { name: "GREY", storeId: store.id },
        { name: "GREEN", storeId: store.id },
        { name: "SILVER", storeId: store.id },
        { name: "MULTI COLOR", storeId: store.id },
        { name: "ORANGE", storeId: store.id },
        { name: "PINK", storeId: store.id },
        { name: "PURPLE", storeId: store.id },
        { name: "RED", storeId: store.id },
        { name: "WHITE", storeId: store.id },
        { name: "YELLOW", storeId: store.id },
        { name: "ANIMAL PRINT", storeId: store.id },
        { name: "KHAKI", storeId: store.id },
        { name: "BEIGE", storeId: store.id },
        { name: "CAMO PRINT", storeId: store.id },
        { name: "TAN", storeId: store.id },
        { name: "NAVY", storeId: store.id },
        { name: "N/A", storeId: store.id },
      ],
    });

    const materials = await prismadb.material.createMany({
      data: [
        { name: "COTTON", storeId: store.id },
        { name: "LINEN", storeId: store.id },
        { name: "WOOL", storeId: store.id },
        { name: "SILK", storeId: store.id },
        { name: "POLYESTER", storeId: store.id },
        { name: "NYLON", storeId: store.id },
        { name: "RAYON", storeId: store.id },
        { name: "LACE", storeId: store.id },
        { name: "VELVET", storeId: store.id },
        { name: "LEATHER", storeId: store.id },
        { name: "HEMP", storeId: store.id },
        { name: "BAMBOO", storeId: store.id },
        { name: "VISCOSE", storeId: store.id },
        { name: "ACRYLIC", storeId: store.id },
        { name: "BEADING/SEQUINS", storeId: store.id },
        { name: "FUR", storeId: store.id },
        { name: "SHELL", storeId: store.id },
        { name: "METAL", storeId: store.id },
        { name: "JERSEY", storeId: store.id },
        { name: "KNIT", storeId: store.id },
        { name: "MESH", storeId: store.id },
        { name: "CANVAS", storeId: store.id },
        { name: "FLEECE", storeId: store.id },
        { name: "PLASTIC", storeId: store.id },
        { name: "SATIN", storeId: store.id },
        { name: "WOOD", storeId: store.id },
        { name: "DENIM", storeId: store.id },
        { name: "PLEATHER", storeId: store.id },
      ],
    });

    const categories = await prismadb.category.createMany({
      data: [
        { name: "ACCESSORIES", storeId: store.id },
        { name: "BAGS", storeId: store.id },
        { name: "HOME", storeId: store.id },
        { name: "JEWELLERY & WATCHES", storeId: store.id },
        { name: "SHOES", storeId: store.id },
        { name: "COATS & JACKETS", storeId: store.id },
        { name: "JEANS", storeId: store.id },
        { name: "DRESSES", storeId: store.id },
        { name: "JUMPSUITS & PLAYSUITS", storeId: store.id },
        { name: "KNITWEAR", storeId: store.id },
        { name: "LOUNGEWEAR", storeId: store.id },
        { name: "MATCHING SET", storeId: store.id },
        { name: "PANTS", storeId: store.id },
        { name: "SHORTS", storeId: store.id },
        { name: "SKIRTS", storeId: store.id },
        { name: "SPORTSWEAR", storeId: store.id },
        { name: "SWIMWEAR", storeId: store.id },
        { name: "SUITS", storeId: store.id },
        { name: "BOARDIES", storeId: store.id },
        { name: "TOPS", storeId: store.id },
        { name: "CORSET", storeId: store.id },
        { name: "VEST", storeId: store.id },
        { name: "UNDERWEAR", storeId: store.id },
        { name: "BODYSUIT", storeId: store.id },
        { name: "SHIRTS", storeId: store.id },
        { name: "SWEATS", storeId: store.id },
        { name: "T-SHIRT", storeId: store.id },
        { name: "N/A", storeId: store.id },
      ],
    });

    const subcategories = await prismadb.subcategory.createMany({
      data: [
        { name: "N/A", storeId: store.id },
      ],
    });

    const conditions = await prismadb.condition.createMany({
      data: [
        { name: "Used - New", storeId: store.id },
        { name: "Used - Good", storeId: store.id },
        { name: "Used - Minor Flaws", storeId: store.id },
        { name: "Vintage - New", storeId: store.id },
        { name: "Vintage - Good", storeId: store.id },
        { name: "Vintage - Minor Flaws", storeId: store.id },
        { name: "Up-cycled - New", storeId: store.id },
        { name: "N/A", storeId: store.id },
      ],
    });

    const billboards = await prismadb.billboard.createMany({
      data: [
        {
          label: "HomePageFullScreen",
          imageUrl:
            "https://stella-ecomm-media-bucket.s3.amazonaws.com/uploads/billboardhome.jpg",
          storeId: store.id,
        },
        {
          label: "HomePageMobile",
          imageUrl:
            "https://stella-ecomm-media-bucket.s3.amazonaws.com/uploads/mobilehome.jpg",
          storeId: store.id,
        },
      ],
    });

    // TODO: create a webhook with permissions to take payments
    //const webhookEndpoint = await stripe.webhookEndpoints.create({
    // enabled_events: ['charge.succeeded', 'charge.failed'],
    // url: `https://stella-admin-six.vercel.app/api/${store.id}/webhook`,  // This will change to our app name
    // });

    //TODO: Your going to have to store the webhook secret in the database eg storePaymentWebhook: webhookEndpoint.secret and figure out where its used because right now its in your .env


    console.group(`[${logKey}_POST]`);
    console.log("[INFO] New Store Created:", store);
    console.log("[INFO] New template Created Sizes added:", sizes);
    console.log("[INFO] New template Created Genders added:", genders);
    console.log("[INFO] New template Created Categories added:", categories);
    console.log("[INFO] New template Created Color added:", colors);
    console.log("[INFO] New template Created Material added:", materials);
    console.log("[INFO] New template Created Billboards added:", billboards);
    console.log("[INFO] New template Created subcategories added:", subcategories);
    console.log("[INFO] New template Created conditions added:", conditions);
    console.log("[INFO] New Seller Created:", seller);
    console.log("[INFO] New Location Created:", location);
    console.groupEnd();
    return NextResponse.json(store);
  } catch (error) {
    console.log(`[${logKey}_POST]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const url = new URL(req.url);
    const storeId = url.searchParams.get("storeId");
    console.group(`[ENTERING_${logKey}_GET]`);
    console.log(`%c[INFO] ${logKey}_GET url: `, url);
    console.log(`%c[INFO] ${logKey}_GET storeId: `, storeId);
    console.groupEnd();

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

    console.group(`[${logKey}_GET]`);
    console.log("%c[INFO] Store Get: ", store);
    console.groupEnd();
    return NextResponse.json(store);
  } catch (error) {
    console.log("[API_STORE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
