import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decode } from "next-auth/jwt"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
    }

    const tokenString = authHeader.split(' ')[1]
    
    const decoded = await decode({
      token: tokenString,
      secret: process.env.NEXTAUTH_SECRET || "secret_for_development_replace_later",
      salt: "authjs.session-token"
    })

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id as string },
      select: {
        name: true,
        image: true,
        chatColor: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Profile API Error:", error)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
