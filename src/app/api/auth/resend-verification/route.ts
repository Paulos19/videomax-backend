import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"

  const rateResult = checkRateLimit(`resend-verification:${ip}`, 3, 60_000)
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Muitas solicitações. Aguarde um minuto antes de reenviar." },
      { status: 429, headers: rateLimitHeaders(rateResult) }
    )
  }

  try {
    const session = await auth()
    let targetEmail: string | undefined = session?.user?.email ?? undefined

    if (!targetEmail) {
      try {
        const body = await req.json()
        targetEmail = body.email?.trim().toLowerCase()
      } catch {}
    }

    if (!targetEmail) {
      return NextResponse.json({ error: "E-mail não informado." }, { status: 400 })
    }

    const cleanEmail = targetEmail.trim().toLowerCase()

    const user = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Este e-mail já foi verificado!", alreadyVerified: true },
        { status: 200 }
      )
    }

    // Invalidate previous tokens
    await prisma.emailVerificationToken.updateMany({
      where: { email: cleanEmail, used: false },
      data: { used: true },
    })

    // Create fresh token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        email: cleanEmail,
        token,
        expiresAt,
      },
    })

    await sendVerificationEmail({
      email: cleanEmail,
      name: user.name || cleanEmail.split("@")[0],
      token,
    })

    return NextResponse.json({
      message: `E-mail de ativação reenviado para ${cleanEmail}!`,
    })
  } catch (error: any) {
    console.error("Erro ao reenviar e-mail de ativação:", error)
    return NextResponse.json(
      { error: "Falha ao reenviar e-mail de ativação. Tente novamente mais tarde." },
      { status: 500 }
    )
  }
}
