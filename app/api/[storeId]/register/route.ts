import bcrypt from "bcrypt";
import prisma from "../../../libs/prismadb";
import { NextResponse } from "next/server";
import { postUserToKlaviyoWelcomeList } from "@/actions/klaviyo/post-profile-to-klaviyo-welcome-list";
import { createProfileInKlaviyo } from "@/actions/klaviyo/create-profile-in-klaviyo";

export async function OPTIONS(request: Request) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  headers.set("Access-Control-Allow-Credentials", "true");

  return new NextResponse(null, { status: 204, headers });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");

    const userKlaviyoProfile = await createProfileInKlaviyo(
      user.name,
      user.email
    );
    const userKlaviyoProfileId = userKlaviyoProfile.data.id;
    console.log("KLAVIYO_RESPONSEPROFILE", userKlaviyoProfile);
    console.log("userKlaviyoProfile.data.id", userKlaviyoProfile.data.id);


    const klaviyoResponseList = await postUserToKlaviyoWelcomeList(
      user.name,
      user.email,
      userKlaviyoProfileId,
      "WPxyeH"
    );
    console.log("KLAVIYO_RESPONSELIST", klaviyoResponseList);
    console.log("USER_REGISTERED", user);
    return new NextResponse(JSON.stringify(user), { status: 201, headers });
  } catch (error: any) {
    console.log(error, "REGISTRATION ERROR");
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    return new NextResponse("Internal Error", { status: 500, headers });
  }
}
