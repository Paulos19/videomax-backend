import { NextResponse } from 'next/server'
import {
  sendWelcomeEmail,
  sendPasswordResetCode,
  sendRoomInviteEmail,
  sendProUpgradeEmail,
  sendPasswordChangedEmail,
  sendVerificationEmail,
} from '@/lib/email'

export async function POST(req: Request) {
  try {
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
