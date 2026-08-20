import nodemailer from 'nodemailer'
import {
  wrapEmailTemplate,
  renderEmailTemplatePreview,
  APP_URL,
} from './email-templates'

export { wrapEmailTemplate, renderEmailTemplatePreview, APP_URL }

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

/**
 * 1. Template: Welcome Email (Boas-Vindas)
 */
export async function sendWelcomeEmail({
  email,
  name,
}: {
  email: string
  name: string
}) {
  const contentHtml = `
    <div style="background-color: #0E0E14; border: 1px solid #22222E; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #CCCCCC; line-height: 1.6;">
        Olá, <strong style="color: #FFFFFF;">${name}</strong>! Seu registro no <strong>VideoMax</strong> foi concluído com sucesso.
      </p>

      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding: 8px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="24" style="color: #FF5A00; font-size: 14px; font-weight: bold;">▶</td>
                <td style="font-size: 12px; color: #E5E5E5;">
                  <strong style="color: #FF5A00;">Salas 0ms:</strong> Crie salas instantâneas e convide amigos com 1 clique.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="24" style="color: #22C55E; font-size: 14px; font-weight: bold;">💬</td>
                <td style="font-size: 12px; color: #E5E5E5;">
                  <strong style="color: #22C55E;">Chat em Tempo Real:</strong> Reações em tempo real, figurinhas animadas e respostas.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="24" style="color: #FFB800; font-size: 14px; font-weight: bold;">💻</td>
                <td style="font-size: 12px; color: #E5E5E5;">
                  <strong style="color: #FFB800;">Transmissão de Tela:</strong> Transmita sua tela com baixa latência via WebRTC.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 11.5px; color: #777777; text-align: center;">
      Dica: Você pode colar qualquer link do YouTube no dashboard para iniciar a reprodução sincronizada.
    </p>
  `

  const html = wrapEmailTemplate({
    previewText: `Bem-vindo ao VideoMax, ${name}! Sua central de salas de cinema social está pronta.`,
    titleBadge: 'ACESSO LIBERADO',
    heading: 'BEM-VINDO AO VIDEOMAX',
    subheading: 'Sua conta foi criada. Agora você pode criar e entrar em salas sincronizadas sem delay.',
    contentHtml,
    ctaText: 'ACESSAR MINHA CONTA 🚀',
    ctaUrl: `${APP_URL}/dashboard`,
    accentColor: '#FF5A00',
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'VideoMax <paulohenrique.012araujo@gmail.com>',
    to: email,
    subject: '🚀 Bem-vindo ao VideoMax — Sua conta está ativa!',
    html,
  })
}

/**
 * 2. Template: Password Reset Token (Redefinição de Senha)
 */
export async function sendPasswordResetCode(email: string, code: string, name?: string) {
  const contentHtml = `
    <div style="background-color: #0E0E14; border: 1px solid #22222E; padding: 24px; text-align: center; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0 0 12px 0; font-size: 11.5px; color: #888888; letter-spacing: 1px; text-transform: uppercase;">
        TOKEN DE VERIFICAÇÃO (6 DÍGITOS)
      </p>

      <div style="display: inline-block; background-color: #08080C; border: 1px solid #FF5A00; padding: 14px 28px; margin: 8px 0; box-shadow: 0 0 20px rgba(255,90,0,0.25);">
        <span style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #FF5A00;">
          ${code}
        </span>
      </div>

      <p style="margin: 12px 0 0 0; font-size: 11px; color: #EF2020; font-weight: bold;">
        ⏱️ Este código expira em exatamente 10 minutos.
      </p>
    </div>

    <div style="padding: 12px; background-color: #120A0A; border-left: 3px solid #EF2020; margin-top: 16px;">
      <p style="margin: 0; font-size: 11px; color: #A3A3A3; line-height: 1.5;">
        <strong>Aviso de Segurança:</strong> Se você não solicitou a redefinição de senha, nenhuma ação é necessária. Sua senha atual continua segura.
      </p>
    </div>
  `

  const html = wrapEmailTemplate({
    previewText: `Seu código de segurança VideoMax é ${code}. Válido por 10 minutos.`,
    titleBadge: 'SEGURANÇA DA CONTA',
    heading: 'REDEFINIÇÃO DE SENHA',
    subheading: name
      ? `Olá, ${name}. Recebemos uma solicitação para redefinir sua senha.`
      : 'Recebemos uma solicitação para redefinir o acesso à sua conta.',
    contentHtml,
    accentColor: '#EF2020',
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'VideoMax <paulohenrique.012araujo@gmail.com>',
    to: email,
    subject: `🔐 VideoMax — Código de Recuperação: ${code}`,
    html,
  })
}

/**
 * 3. Template: Room Invitation (Convite para Sala de Transmissão)
 */
export async function sendRoomInviteEmail({
  toEmail,
  inviterName,
  roomTitle,
  roomCode,
  roomUrl,
}: {
  toEmail: string
  inviterName: string
  roomTitle: string
  roomCode: string
  roomUrl?: string
}) {
  const joinUrl = roomUrl || `${APP_URL}/room/${roomCode}`

  const contentHtml = `
    <div style="background-color: #0E0E14; border: 1px solid #22222E; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #E5E5E5; line-height: 1.5;">
        <strong style="color: #FF5A00;">${inviterName}</strong> convidou você para assistir a uma transmissão ao vivo no <strong>VideoMax</strong>!
      </p>

      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08080C; border: 1px solid #1F1F28; padding: 14px; margin-top: 12px;">
        <tr>
          <td>
            <span style="font-size: 9px; color: #777777; text-transform: uppercase; letter-spacing: 1px; display: block;">SALA AO VIVO</span>
            <span style="font-size: 15px; font-weight: bold; color: #FFFFFF; display: block; margin-top: 2px;">
              ${roomTitle}
            </span>
            <span style="font-size: 11px; font-family: monospace; color: #FF5A00; display: block; margin-top: 4px;">
              CÓDIGO: #${roomCode}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 11.5px; color: #888888; text-align: center;">
      Não é necessário instalar nada — basta clicar no botão abaixo para assistir em sincronia instantânea.
    </p>
  `

  const html = wrapEmailTemplate({
    previewText: `${inviterName} convidou você para assistir: ${roomTitle}`,
    titleBadge: 'CONVITE AO VIVO',
    heading: 'VOCÊ FOI CONVIDADO',
    subheading: 'Junte-se à transmissão para assistir, conversar e reagir em tempo real.',
    contentHtml,
    ctaText: 'ENTRAR NA SALA AGORA 🍿',
    ctaUrl: joinUrl,
    accentColor: '#FF5A00',
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'VideoMax <paulohenrique.012araujo@gmail.com>',
    to: toEmail,
    subject: `🍿 ${inviterName} convidou você para assistir "${roomTitle}" no VideoMax`,
    html,
  })
}

/**
 * 4. Template: MaxPro VIP Upgrade Activation
 */
export async function sendProUpgradeEmail({
  email,
  name,
  plan = 'MAXPRO VIP',
}: {
  email: string
  name: string
  plan?: string
}) {
  const contentHtml = `
    <div style="background-color: #141005; border: 1px solid #FFE600; padding: 24px; margin: 20px 0; border-radius: 6px; box-shadow: 0 0 30px rgba(255,230,0,0.15);">
      <div style="text-align: center; margin-bottom: 16px;">
        <span style="font-size: 32px;">👑</span>
        <h3 style="margin: 8px 0 0 0; font-size: 16px; color: #FFE600; font-weight: 900; letter-spacing: 2px;">
          ${plan.toUpperCase()} ATIVO
        </h3>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 13px; color: #D4D4D4; line-height: 1.6; text-align: center;">
        Parabéns, <strong>${name}</strong>! Todos os recursos premium de transmissão ilimitada foram desbloqueados na sua conta.
      </p>

      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #332808; padding-top: 12px;">
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #FFE600;">✔ Resolução Nativa 1080p Full HD</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #FFE600;">✔ Sincronia Mesh 6x de Ultra Baixa Latência</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #FFE600;">✔ Badge Dourado Exclusivo de Host VIP no Chat</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #FFE600;">✔ Armazenamento em Nuvem Ilimitado</td>
        </tr>
      </table>
    </div>
  `

  const html = wrapEmailTemplate({
    previewText: `Parabéns ${name}! Sua assinatura MAXPRO VIP está ativa.`,
    titleBadge: 'UPGRADE DE CONTA',
    heading: 'SEU STATUS VIP ESTÁ ATIVO',
    subheading: 'Aproveite o máximo de qualidade, sincronia e recursos exclusivos.',
    contentHtml,
    ctaText: 'CRIAR SALA MAXPRO 👑',
    ctaUrl: `${APP_URL}/dashboard`,
    accentColor: '#FFE600',
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'VideoMax <paulohenrique.012araujo@gmail.com>',
    to: email,
    subject: '👑 VideoMax — Sua assinatura MAXPRO VIP foi ativada com sucesso!',
    html,
  })
}

/**
 * 5. Template: Password Changed Security Alert
 */
export async function sendPasswordChangedEmail({
  email,
  name,
}: {
  email: string
  name: string
}) {
  const contentHtml = `
    <div style="background-color: #0E0E14; border: 1px solid #22222E; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #E5E5E5; line-height: 1.6;">
        Olá, <strong>${name}</strong>. Informamos que a senha da sua conta VideoMax foi alterada com sucesso em <strong>${new Date().toLocaleString('pt-BR')}</strong>.
      </p>

      <div style="padding: 12px; background-color: #120A0A; border-left: 3px solid #EF2020; margin-top: 12px;">
        <p style="margin: 0; font-size: 11px; color: #A3A3A3; line-height: 1.5;">
          Se você realizou essa alteração, nenhuma ação adicional é necessária. Se você não reconhece esta atividade, recupere sua conta imediatamente.
        </p>
      </div>
    </div>
  `

  const html = wrapEmailTemplate({
    previewText: `Sua senha VideoMax foi alterada com sucesso.`,
    titleBadge: 'SEGURANÇA DA CONTA',
    heading: 'SENHA ATUALIZADA',
    subheading: 'A credencial de acesso da sua conta foi redefinida.',
    contentHtml,
    ctaText: 'ACESSAR MINHA CONTA',
    ctaUrl: `${APP_URL}/login`,
    accentColor: '#22C55E',
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'VideoMax <paulohenrique.012araujo@gmail.com>',
    to: email,
    subject: '🛡️ VideoMax — Sua senha foi alterada com sucesso',
    html,
  })
}

/**
 * 6. Template: Email Verification (Ativação de Conta)
 */
export async function sendVerificationEmail({
  email,
  name,
  token,
}: {
  email: string
  name: string
  token: string
}) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`

  const contentHtml = `
    <div style="background-color: #0E0E14; border: 1px solid #22222E; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #E5E5E5; line-height: 1.6;">
        Olá, <strong style="color: #FFFFFF;">${name}</strong>! Confirme seu e-mail para ativar sua conta e desbloquear todas as funções do <strong>VideoMax</strong>:
      </p>

      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding: 6px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="24" style="color: #22C55E; font-size: 14px; font-weight: bold;">✔</td>
                <td style="font-size: 12px; color: #CCCCCC;">
                  <strong style="color: #FFFFFF;">Criação de Salas:</strong> Transmissão de vídeos do YouTube e arquivos locais.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="24" style="color: #22C55E; font-size: 14px; font-weight: bold;">✔</td>
                <td style="font-size: 12px; color: #CCCCCC;">
                  <strong style="color: #FFFFFF;">Amigos & Convites:</strong> Adicione amigos e envie convites diretos.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>

    <div style="padding: 12px; background-color: #120A0A; border-left: 3px solid #FF5A00; margin: 16px 0;">
      <p style="margin: 0; font-size: 11px; color: #A3A3A3; line-height: 1.5;">
        ⏱️ Este link de confirmação expira em <strong>24 horas</strong>. Se você não criou esta conta, ignore este e-mail.
      </p>
    </div>
  `

  const html = wrapEmailTemplate({
    previewText: `Olá ${name}! Confirme seu e-mail no VideoMax para liberar a criação de salas.`,
    titleBadge: 'ATIVAÇÃO DE CONTA',
    heading: 'CONFIRME SEU E-MAIL',
    subheading: 'Falta apenas um clique para você desbloquear o ecossistema completo do VideoMax.',
    contentHtml,
    ctaText: 'CONFIRMAR MEU E-MAIL 🚀',
    ctaUrl: verifyUrl,
    accentColor: '#FF5A00',
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'VideoMax <paulohenrique.012araujo@gmail.com>',
    to: email,
    subject: '⚡ VideoMax — Confirme seu e-mail para ativar sua conta',
    html,
  })
}
