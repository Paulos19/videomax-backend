import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import { z } from "zod"
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit"

const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

export async function POST(req: Request) {
  // Rate limit: 5 login attempts per minute per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
  const rateKey = `login:${ip}`
  const rateResult = checkRateLimit(rateKey, 5, 60_000)

  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: rateLimitHeaders(rateResult) }
    )
  }

  try {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      return NextResponse.json({ error: "Configuração de servidor incompleta." }, { status: 500 })
    }

    const body = await req.json()
    const result = LoginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { email, password } = result.data

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 })
    }

    // Sign JWT with jose — same library and algorithm as the WebSocket server
    const secretBytes = new TextEncoder().encode(secret)
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secretBytes)

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    })
  } catch {
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 })
  }
}
