import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { encode } from "next-auth/jwt"
import { z } from "zod"

const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

export async function POST(req: Request) {
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

    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      secret,
      salt: "authjs.session-token"
    })

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    })
  } catch (error) {
    console.error("Mobile Auth Error:", error)
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 })
  }
}
