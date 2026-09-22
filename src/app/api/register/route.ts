import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { registerApiSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerApiSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0]?.message || "Validation failed";
      return NextResponse.json(
        {
          error: firstError,
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, name, password } = result.data;

    const exist = await prisma.user.findUnique({
      where: { email },
    });

    if (exist) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const created = await auth.api.signUpEmail({
      body: {
        email,
        name,
        password,
      },
    });

    return NextResponse.json({
      user: {
        id: created.user.id,
        email: created.user.email,
        name: created.user.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
