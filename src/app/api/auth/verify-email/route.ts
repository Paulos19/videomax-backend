import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token de verificação inválido ou ausente." },
        { status: 400 }
      )
    }

    const verificationRecord = await prisma.emailVerificationToken.findUnique({
      where: { token },
    })

    if (!verificationRecord) {
      return NextResponse.json(
        { error: "Token de ativação não encontrado. Solicite um novo link de confirmação." },
        { status: 400 }
      )
    }

    if (verificationRecord.used) {
      return NextResponse.json(
        { message: "Este link já foi utilizado. Sua conta já está ativada!", alreadyVerified: true },
        { status: 200 }
      )
    }

    if (verificationRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Este link de ativação expirou (válido por 24h). Solicite um novo link.", expired: true },
        { status: 400 }
      )
    }

    // Find and update user
    const user = await prisma.user.findFirst({
      where: { email: { equals: verificationRecord.email, mode: "insensitive" } },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário associado a este token não foi encontrado." },
        { status: 404 }
      )
    }

    const now = new Date()

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: now },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationRecord.id },
        data: { used: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: "E-mail verificado com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: now,
      },
    })
  } catch (error: any) {
    console.error("Erro ao verificar e-mail:", error)
    return NextResponse.json(
      { error: "Falha ao processar a verificação de e-mail." },
      { status: 500 }
    )
  }
}
