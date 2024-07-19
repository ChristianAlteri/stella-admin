import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import prisma from "../../../libs/prismadb";


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
    console.log("body", body);
    if (!email || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    console.log("user", user);
    if (!user || !user?.hashedPassword) {
      throw new Error("Invalid credentials");
    }

    const isCorrectPassword = await bcrypt.compare(
      password,
      user.hashedPassword
    );

    console.log("isCorrectPassword", isCorrectPassword);
    if (!isCorrectPassword) {
      return new NextResponse(
        JSON.stringify(new Error("Invalid credentials")),
        { status: 500 }
      );
      //   throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, "SUPERSECRET", { expiresIn: '1h' });

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");


    // return new NextResponse(JSON.stringify(user), { status: 201, headers });
    return new NextResponse(JSON.stringify({ token }), { status: 201, headers });
  } catch (error: any) {
    console.log(error, "REGISTRATION ERROR");
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    return new NextResponse("Internal Error", { status: 500, headers });
  }
}
