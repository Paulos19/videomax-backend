import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jwtVerify } from "jose"
import { auth } from "@/auth"

export async function GET(req: Request) {
  try {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      return NextResponse.json({ error: "Configuração de servidor incompleta." }, { status: 500 })
    }

    let userId: string | null = null

    // 1) Tenta via Bearer token (mobile)
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const tokenString = authHeader.split(' ')[1]
      try {
        const secretBytes = new TextEncoder().encode(secret)
        const { payload } = await jwtVerify(tokenString, secretBytes, { algorithms: ['HS256'] })
        if (payload?.id) {
          userId = payload.id as string
        }
      } catch {
        // Token inválido — tenta via sessão
      }
    }

    // 2) Fallback: session via cookie (web)
    if (!userId) {
      const session = await auth()
      if (session?.user?.id) {
        userId = session.user.id
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        chatColor: true,
        createdAt: true
      }
    })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 })
  }
}
