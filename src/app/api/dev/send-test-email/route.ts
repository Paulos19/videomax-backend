import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import {
  sendWelcomeEmail,
  sendPasswordResetCode,
  sendRoomInviteEmail,
  sendProUpgradeEmail,
  sendPasswordChangedEmail,
  sendVerificationEmail,
} from '@/lib/email'

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  const rateResult = checkRateLimit(`send-test-email:${ip}`, 5, 60_000)
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: 'Muitas solicitações de teste. Aguarde um minuto.' },
      { status: 429, headers: rateLimitHeaders(rateResult) }
    )
  }

  try {
    const session = await auth()
    const isAdmin =
      session?.user?.email &&
      (session.user.email === process.env.EMAIL_ADMIN_USER ||
        session.user.email === process.env.EMAIL_SERVER_USER)

    if (process.env.NODE_ENV === 'production' && !isAdmin) {
      return NextResponse.json(
        { error: 'Acesso não autorizado a rotas de desenvolvimento em produção.' },
        { status: 403 }
      )
    }

    const { email, type } = await req.json()

    if (!email || !type) {
      return NextResponse.json({ error: 'E-mail e tipo de template são obrigatórios.' }, { status: 400 })
    }

    switch (type) {
      case 'verification':
        await sendVerificationEmail({ email, name: 'CyberUser', token: 'sample_test_token_123' })
        break
      case 'welcome':
        await sendWelcomeEmail({ email, name: 'CyberUser' })
        break
      case 'reset':
        await sendPasswordResetCode(email, '849201', 'CyberUser')
        break
      case 'invite':
        await sendRoomInviteEmail({
          toEmail: email,
          inviterName: 'Alex (Host)',
          roomTitle: 'David Kushner - Daylight (Official Music Video)',
          roomCode: 'TH54QG',
        })
        break
      case 'pro':
        await sendProUpgradeEmail({ email, name: 'Alex', plan: 'MAXPRO VIP' })
        break
      case 'password_changed':
        await sendPasswordChangedEmail({ email, name: 'Alex' })
        break
      default:
        return NextResponse.json({ error: 'Tipo de template inválido.' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: `E-mail de teste (${type}) enviado para ${email}!` })
  } catch (error: any) {
    console.error('Erro ao enviar e-mail de teste:', error)
    return NextResponse.json({ error: error.message || 'Falha ao disparar e-mail de teste.' }, { status: 500 })
  }
}
