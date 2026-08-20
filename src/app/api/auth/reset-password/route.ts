import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit"
import { sendPasswordChangedEmail } from "@/lib/email"

const ResetPasswordSchema = z.object({
  email: z.string().email("E-mail inválido").toLowerCase(),
  code: z.string().length(6, "O código deve ter 6 dígitos"),
  newPassword: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(128, "A senha deve ter no máximo 128 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
})

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  const rateResult = checkRateLimit(`reset-password:${ip}`, 5, 60_000)

  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um momento." },
      { status: 429, headers: rateLimitHeaders(rateResult) }
    )
  }

  try {
    const body = await req.json()
    const result = ResetPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, code, newPassword } = result.data
    const cleanEmail = email.trim().toLowerCase()

    // Dual rate limit: by IP and by target email to prevent distributed brute-force
    const emailRateResult = checkRateLimit(`reset-password:email:${cleanEmail}`, 5, 900_000)
    if (!emailRateResult.allowed) {
      return NextResponse.json(
        { error: "Limite de tentativas excedido para este e-mail. Solicite um novo código de recuperação." },
        { status: 429, headers: rateLimitHeaders(emailRateResult) }
      )
    }

    // Find valid reset code
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        email: cleanEmail,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Código inválido ou expirado. Solicite um novo código." },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 400 }
      )
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ])

    // Send confirmation security alert asynchronously
    sendPasswordChangedEmail({
      email: cleanEmail,
      name: user.name || 'Usuário',
    }).catch((err) => {
      console.error("Erro ao enviar e-mail de confirmação de senha:", err)
    })

    return NextResponse.json({
      message: "Senha redefinida com sucesso!",
    })
  } catch (error) {
    console.error("Erro no reset-password:", error)
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    )
  }
}
