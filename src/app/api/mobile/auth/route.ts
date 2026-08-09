import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { encode } from "next-auth/jwt"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios." }, { status: 400 })
    }

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

    // Gera um token JWT usando a mesma chave do NextAuth (Auth.js)
    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      secret: process.env.NEXTAUTH_SECRET || "secret_for_development_replace_later",
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
