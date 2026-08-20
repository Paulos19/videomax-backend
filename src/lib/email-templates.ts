export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  'http://localhost:3000'

/**
 * Shared Cyberpunk Obsidian Email Frame (100% Browser and Server Compatible)
 */
export function wrapEmailTemplate({
  previewText,
  titleBadge,
  heading,
  subheading,
  contentHtml,
  ctaText,
  ctaUrl,
  accentColor = '#FF5A00',
}: {
  previewText: string
  titleBadge: string
  heading: string
  subheading?: string
  contentHtml: string
  ctaText?: string
  ctaUrl?: string
  accentColor?: string
}) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${heading}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#050505; color:#F5F5F5; font-family:'JetBrains Mono', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; -webkit-font-smoothing:antialiased;">
  <!-- Preview text -->
  <div style="display:none;font-size:1px;color:#050505;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#050505; padding: 40px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (560px max width) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px; background-color:#09090D; border:1px solid #262635; border-radius:12px; overflow:hidden; box-shadow:0 30px 90px rgba(0,0,0,0.9);">
          
          <!-- Top Neon Accent Line -->
          <tr>
            <td height="3" style="background: linear-gradient(90deg, #EF2020 0%, ${accentColor} 50%, #FFB800 100%);"></td>
          </tr>

          <!-- Header: Brand Logo & System Telemetry -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1F1F28;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <!-- VideoMax Brutalist Brand Block -->
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="28" height="28" align="center" valign="middle" style="background-color:#FF5A00; text-align:center; vertical-align:middle; line-height:0;">
                          <span style="font-size:14px; color:#050505; font-weight:900; line-height:1;">▶</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <span style="font-size: 16px; font-weight: 900; letter-spacing: 1px; color: #FFFFFF; display: block; line-height: 1.1;">VIDEOMAX</span>
                          <span style="font-size: 8px; font-weight: 700; letter-spacing: 2px; color: #FF5A00; text-transform: uppercase; display: block; margin-top: 3px;">[ PROTOCOLO 0MS ]</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <span style="display:inline-block; padding: 3px 8px; background-color: #0D0D14; border: 1px solid #262635; font-size: 9px; font-weight: 700; color: #22C55E; letter-spacing: 1px; text-transform: uppercase;">
                      ● ONLINE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 32px 32px;">
              
              <!-- Badge -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background-color: ${accentColor}15; border: 1px solid ${accentColor}50; padding: 4px 10px; font-size: 9px; font-weight: 800; color: ${accentColor}; letter-spacing: 2px; text-transform: uppercase;">
                    [ ${titleBadge} ]
                  </td>
                </tr>
              </table>

              <!-- Main Heading -->
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; text-transform: uppercase; line-height: 1.25;">
                ${heading}
              </h1>

              ${
                subheading
                  ? `<p style="margin: 0 0 24px 0; font-size: 13px; color: #8A8A93; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      ${subheading}
                    </p>`
                  : '<div style="height: 16px;"></div>'
              }

              <!-- Dynamic Content Block -->
              <div style="color: #D4D4D8; font-size: 13px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${contentHtml}
              </div>

              ${
                ctaText && ctaUrl
                  ? `
                <!-- CTA Button -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                  <tr>
                    <td align="center">
                      <table border="0" cellspacing="0" cellpadding="0" style="width: 100%;">
                        <tr>
                          <td align="center" style="background: linear-gradient(90deg, #EF2020 0%, #FF5A00 50%, #FFB800 100%); padding: 14px 28px; box-shadow: 0 0 25px rgba(255,90,0,0.35);">
                            <a href="${ctaUrl}" target="_blank" style="font-size: 12px; font-weight: 900; color: #000000; text-decoration: none; letter-spacing: 1.5px; text-transform: uppercase; display: block; font-family: 'JetBrains Mono', monospace;">
                              ${ctaText}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                `
                  : ''
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #060608; border-top: 1px solid #1F1F28; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 10px; color: #666670; letter-spacing: 1px; text-transform: uppercase; font-family: 'JetBrains Mono', monospace;">
                VIDEOMAX PROTOCOL // SYNCHRONOUS MESH STREAMING
              </p>
              <p style="margin: 0; font-size: 10px; color: #44444E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Você está recebendo este e-mail por possuir uma conta ativa na plataforma VideoMax.<br />
                © ${new Date().getFullYear()} VideoMax. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function renderEmailTemplatePreview(
  type: 'welcome' | 'reset' | 'invite' | 'pro' | 'password_changed' | 'verification'
): string {
  switch (type) {
    case 'verification':
      return wrapEmailTemplate({
        previewText: 'Olá CyberUser! Confirme seu e-mail no VideoMax para liberar a criação de salas.',
        titleBadge: 'ATIVAÇÃO DE CONTA',
        heading: 'CONFIRME SEU E-MAIL',
        subheading: 'Falta apenas um clique para você desbloquear o ecossistema completo do VideoMax.',
        contentHtml: `
          <div style="background-color: #0E0E14; border: 1px solid #22222E; padding: 20px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0 0 16px 0; font-size: 13px; color: #E5E5E5; line-height: 1.6;">
              Olá, <strong style="color: #FFFFFF;">CyberUser</strong>! Confirme seu e-mail para ativar sua conta e desbloquear todas as funções do <strong>VideoMax</strong>:
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
        `,
        ctaText: 'CONFIRMAR MEU E-MAIL 🚀',
        ctaUrl: `${APP_URL}/verify-email?token=sample_token_preview`,
        accentColor: '#FF5A00',
      })

    case 'welcome':
      return wrapEmailTemplate({
        previewText: 'Bem-vindo ao VideoMax, CyberUser! Sua central de salas está pronta.',
        titleBadge: 'ACESSO LIBERADO',
        heading: 'BEM-VINDO AO VIDEOMAX',
        subheading: 'Sua conta foi criada. Agora você pode criar e entrar em salas sincronizadas sem delay.',
        contentHtml: `
          <div style="background-color: #0E0E14; border: 1px solid #22222E; padding: 20px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0 0 16px 0; font-size: 13px; color: #CCCCCC; line-height: 1.6;">
              Olá, <strong style="color: #FFFFFF;">CyberUser</strong>! Seu registro no <strong>VideoMax</strong> foi concluído com sucesso.
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
        `,
        ctaText: 'ACESSAR MINHA CONTA 🚀',
        ctaUrl: `${APP_URL}/dashboard`,
        accentColor: '#FF5A00',
      })

    case 'reset':
      return wrapEmailTemplate({
        previewText: 'Seu código de redefinição de senha é 849201. Válido por 10 minutos.',
        titleBadge: 'SEGURANÇA DA CONTA',
        heading: 'REDEFINIÇÃO DE SENHA',
        subheading: 'Recebemos uma solicitação para redefinir o acesso à sua conta VideoMax.',
        contentHtml: `
          <div style="background-color: #0E0E14; border: 1px solid #22222E; padding: 24px; text-align: center; margin: 24px 0; border-radius: 6px;">
            <p style="margin: 0 0 12px 0; font-size: 11.5px; color: #888888; letter-spacing: 1px; text-transform: uppercase;">
              TOKEN DE VERIFICAÇÃO (6 DÍGITOS)
            </p>
            <div style="display: inline-block; background-color: #08080C; border: 1px solid #FF5A00; padding: 14px 28px; margin: 8px 0; box-shadow: 0 0 20px rgba(255,90,0,0.25);">
              <span style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #FF5A00;">
                849201
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
        `,
        accentColor: '#EF2020',
      })

    case 'invite':
      return wrapEmailTemplate({
        previewText: 'Alex convidou você para assistir ao vivo: David Kushner - Daylight',
        titleBadge: 'CONVITE AO VIVO',
        heading: 'VOCÊ FOI CONVIDADO',
        subheading: 'Junte-se à transmissão para assistir, conversar e reagir em tempo real.',
        contentHtml: `
          <div style="background-color: #0E0E14; border: 1px solid #22222E; padding: 20px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #E5E5E5; line-height: 1.5;">
              <strong style="color: #FF5A00;">Alex (Host)</strong> convidou você para assistir a uma transmissão ao vivo no <strong>VideoMax</strong>!
            </p>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08080C; border: 1px solid #1F1F28; padding: 14px; margin-top: 12px;">
              <tr>
                <td>
                  <span style="font-size: 9px; color: #777777; text-transform: uppercase; letter-spacing: 1px; display: block;">SALA AO VIVO</span>
                  <span style="font-size: 15px; font-weight: bold; color: #FFFFFF; display: block; margin-top: 2px;">
                    David Kushner - Daylight (Official Music Video)
                  </span>
                  <span style="font-size: 11px; font-family: monospace; color: #FF5A00; display: block; margin-top: 4px;">
                    CÓDIGO: #TH54QG
                  </span>
                </td>
              </tr>
            </table>
          </div>
          <p style="margin: 0; font-size: 11.5px; color: #888888; text-align: center;">
            Não é necessário instalar nada — basta clicar no botão abaixo para assistir em sincronia instantânea.
          </p>
        `,
        ctaText: 'ENTRAR NA SALA AGORA 🍿',
        ctaUrl: `${APP_URL}/room/TH54QG`,
        accentColor: '#FF5A00',
      })

    case 'pro':
      return wrapEmailTemplate({
        previewText: 'Parabéns Alex! Sua assinatura MAXPRO VIP está ativa.',
        titleBadge: 'UPGRADE DE CONTA',
        heading: 'SEU STATUS VIP ESTÁ ATIVO',
        subheading: 'Aproveite o máximo de qualidade, sincronia e recursos exclusivos.',
        contentHtml: `
          <div style="background-color: #141005; border: 1px solid #FFE600; padding: 24px; margin: 20px 0; border-radius: 6px; box-shadow: 0 0 30px rgba(255,230,0,0.15);">
            <div style="text-align: center; margin-bottom: 16px;">
              <span style="font-size: 32px;">👑</span>
              <h3 style="margin: 8px 0 0 0; font-size: 16px; color: #FFE600; font-weight: 900; letter-spacing: 2px;">
                MAXPRO VIP ATIVO
              </h3>
            </div>
            <p style="margin: 0 0 16px 0; font-size: 13px; color: #D4D4D4; line-height: 1.6; text-align: center;">
              Parabéns, <strong>Alex</strong>! Todos os recursos premium de transmissão ilimitada foram desbloqueados na sua conta.
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
        `,
        ctaText: 'CRIAR SALA MAXPRO 👑',
        ctaUrl: `${APP_URL}/dashboard`,
        accentColor: '#FFE600',
      })

    case 'password_changed':
      return wrapEmailTemplate({
        previewText: 'Sua senha VideoMax foi alterada com sucesso.',
        titleBadge: 'SEGURANÇA DA CONTA',
        heading: 'SENHA ATUALIZADA',
        subheading: 'A credencial de acesso da sua conta foi redefinida.',
        contentHtml: `
          <div style="background-color: #0E0E14; border: 1px solid #22222E; padding: 20px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #E5E5E5; line-height: 1.6;">
              Olá, <strong>Alex</strong>. Informamos que a senha da sua conta VideoMax foi alterada com sucesso em <strong>${new Date().toLocaleString('pt-BR')}</strong>.
            </p>
            <div style="padding: 12px; background-color: #120A0A; border-left: 3px solid #EF2020; margin-top: 12px;">
              <p style="margin: 0; font-size: 11px; color: #A3A3A3; line-height: 1.5;">
                Se você realizou essa alteração, nenhuma ação adicional é necessária. Se você não reconhece esta atividade, recupere sua conta imediatamente.
              </p>
            </div>
          </div>
        `,
        ctaText: 'ACESSAR MINHA CONTA',
        ctaUrl: `${APP_URL}/login`,
        accentColor: '#22C55E',
      })
  }
}
