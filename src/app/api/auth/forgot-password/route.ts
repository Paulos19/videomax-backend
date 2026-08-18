import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetCode } from "@/lib/email"
import { z } from "zod"
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit"

const ForgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido").toLowerCase(),
})

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  const rateResult = checkRateLimit(`forgot-password:${ip}`, 3, 60_000)

  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um momento." },
      { status: 429, headers: rateLimitHeaders(rateResult) }
    )
  }

  try {
    const body = await req.json()
    const result = ForgotPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email } = result.data
    const cleanEmail = email.trim().toLowerCase()

    // Always return success to prevent email enumeration
    const user = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
    })

    if (user) {
      // Invalidate previous codes for this email
      await prisma.passwordReset.updateMany({
        where: { email: cleanEmail, used: false },
        data: { used: true },
      })

      const code = generateCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await prisma.passwordReset.create({
        data: {
          email: cleanEmail,
          code,
          expiresAt,
        },
      })

      try {
        await sendPasswordResetCode(cleanEmail, code)
      } catch (emailError) {
        console.error("Erro ao enviar e-mail de recuperação:", emailError)
        return NextResponse.json(
          { error: "Falha ao enviar o e-mail. Tente novamente." },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: "Se o e-mail estiver cadastrado, você receberá um código de recuperação.",
    })
  } catch (error) {
    console.error("Erro no forgot-password:", error)
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    )
  }
}
