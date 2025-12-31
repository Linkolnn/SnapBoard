import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('mail.host');
    const port = this.configService.get<number>('mail.port');
    const user = this.configService.get<string>('mail.user');
    const pass = this.configService.get<string>('mail.pass');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP не настроен. Email отправка отключена.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: port || 587,
      secure: port === 465,
      auth: { user, pass },
    });

    this.logger.log(`SMTP транспорт инициализирован: ${host}:${port}`);
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Email не отправлен (SMTP не настроен): ${options.subject}`);
      return false;
    }

    const from = this.configService.get<string>('mail.from') || 'SnapBoard <noreply@snapboard.com>';

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email отправлен: ${options.to} - ${options.subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Ошибка отправки email: ${error}`);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('frontendUrl') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #10b981; }
          .logo { font-size: 28px; font-weight: bold; color: #10b981; }
          .content { padding: 30px 0; }
          .button { display: inline-block; padding: 14px 28px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .button:hover { background: #059669; }
          .footer { padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📌 SnapBoard</div>
          </div>
          <div class="content">
            <h2>Восстановление пароля</h2>
            <p>Вы запросили сброс пароля для вашего аккаунта SnapBoard.</p>
            <p>Нажмите на кнопку ниже, чтобы создать новый пароль:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" class="button">Сбросить пароль</a>
            </p>
            <div class="warning">
              ⚠️ Ссылка действительна в течение 1 часа. Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
            </div>
            <p>Или скопируйте эту ссылку в браузер:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetLink}</p>
          </div>
          <div class="footer">
            <p>Это автоматическое сообщение от SnapBoard. Пожалуйста, не отвечайте на него.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Восстановление пароля SnapBoard

Вы запросили сброс пароля для вашего аккаунта.

Перейдите по ссылке для создания нового пароля:
${resetLink}

Ссылка действительна в течение 1 часа.

Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
    `;

    return this.sendMail({
      to: email,
      subject: 'Восстановление пароля - SnapBoard',
      html,
      text,
    });
  }
}
