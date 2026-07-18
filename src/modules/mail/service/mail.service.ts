import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendActivationMail(email: string, token: string) {
    const url =
      this.configService.getOrThrow('WEBAPP_URL') + `/activate?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Activación de cuenta',
        html: this.buildActivationTemplate(url),
      });
      Logger.log('Activation email sent succesfully');
    } catch (error) {
      Logger.error('Failed to send activation mail:', error);
    }
  }

  private buildActivationTemplate(url: string): string {
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Activación de cuenta</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f5f7; padding: 32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);">
            <tr>
              <td style="background-color: #1a2b4a; padding: 32px 40px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Kyotei</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 16px; color: #1a2b4a; font-size: 20px; font-weight: 600;">Bienvenido a bordo</h2>
                <p style="margin: 0 0 24px; color: #4a5568; font-size: 15px; line-height: 1.6;">
                  Gracias por registrarte. Para empezar a usar tu cuenta, solo necesitas activarla haciendo clic en el siguiente botón.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
                  <tr>
                    <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                      <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                        Activar mi cuenta
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin: 0 0 8px; color: #718096; font-size: 13px; line-height: 1.6;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:
                </p>
                <p style="margin: 0; word-break: break-all;">
                  <a href="${url}" target="_blank" style="color: #2563eb; font-size: 13px; text-decoration: none;">${url}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.5;">
                  Si no creaste esta cuenta, puedes ignorar este correo.
                </p>
                <p style="margin: 8px 0 0; color: #a0aec0; font-size: 12px;">
                  &copy; ${year} Kyotei. Todos los derechos reservados.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }
}
