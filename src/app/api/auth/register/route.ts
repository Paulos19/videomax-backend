import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const RegisterSchema = z.object({
  name: z
    .string()
    .min(3, "O nickname deve ter no mínimo 3 caracteres")
    .max(50, "O nickname deve ter no máximo 50 caracteres"),
  email: z.string().email("E-mail inválido").toLowerCase(),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(128, "A senha deve ter no máximo 128 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
});

export async function POST(req: Request) {
  // Rate limit: 5 registros por minuto por IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
  const rateResult = checkRateLimit(`register:${ip}`, 5, 60_000);

  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas de cadastro. Aguarde um momento e tente novamente." },
      { status: 429, headers: rateLimitHeaders(rateResult) }
    );
  }

  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password } = result.data;
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if nickname is already in use (case-insensitive)
    const existingName = await prisma.user.findFirst({
      where: {
        name: {
          equals: cleanName,
          mode: "insensitive",
        },
      },
    });

    if (existingName) {
      return NextResponse.json(
        { error: "Este nickname já está em uso. Por favor, escolha outro." },
        { status: 400 }
      );
    }

    // 2. Check if email is already in use (case-insensitive)
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: cleanEmail,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado no sistema." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "Usuário criado com sucesso!" }, { status: 201 });
  } catch (error: any) {
    console.error("Erro interno no registro de usuário:", error);

    // Handle Prisma P2002 Unique Constraint errors
    if (error?.code === "P2002") {
      const target = error.meta?.target;
      if (Array.isArray(target) && target.includes("name")) {
        return NextResponse.json(
          { error: "Este nickname já está em uso. Por favor, escolha outro." },
          { status: 400 }
        );
      }
      if (Array.isArray(target) && target.includes("email")) {
        return NextResponse.json(
          { error: "Este e-mail já está cadastrado no sistema." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Nickname ou e-mail já estão cadastrados." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Falha ao processar o cadastro no banco de dados. Tente novamente." },
      { status: 500 }
    );
  }
}
