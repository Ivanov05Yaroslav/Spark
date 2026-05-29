import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      family: 4, 
    } as any);
  }

    async sendWelcomeEmail(to: string, plainPassword: string) {
    try {
      await this.transporter.sendMail({
        from: `"Spark" <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject: 'Ваш акаунт створено',
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Вітаємо на платформі!</h2>
            <p>Адміністратор успішно створив для вас профіль навчального закладу.</p>
            <p>Ваші дані для першого входу в систему:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 16px;">
              <p style="margin: 5px 0;"><strong>Email (Логін):</strong> ${to}</p>
              <p style="margin: 5px 0;"><strong>Пароль:</strong> <span style="color: #4A90E2; font-family: monospace; font-size: 18px;">${plainPassword}</span></p>
            </div>

            <p style="color: #E24A4A; font-weight: bold;">
              Увага: Після першого успішного входу в систему вам буде необхідно змінити цей пароль на новий з міркувань безпеки!
            </p>
          </div>
        `,
      });
      this.logger.log(`Email з доступами відправлено новому користувачу: ${to}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Помилка відправки welcome-email на ${to}`, errorMessage);
      throw new Error('Не вдалося відправити лист з даними для входу');
    }
  }

  async sendVerificationCode(to: string, code: string) {
    try {
      await this.transporter.sendMail({
        from: `"Spark" <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject: 'Код підтвердження реєстрації',
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Підтвердження електронної пошти</h2>
            <p>Ви розпочали реєстрацію навчального закладу на платформі.</p>
            <p>Ваш код підтвердження:</p>
            <h1 style="color: #4A90E2; letter-spacing: 5px;">${code}</h1>
            <p>Код дійсний протягом 15 хвилин.</p>
          </div>
        `,
      });
      this.logger.log(`Email з кодом відправлено на ${to}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Помилка відправки email на ${to}`, errorMessage);
      throw new Error('Не вдалося відправити лист з кодом підтвердження');
    }
  }

  async sendPasswordResetCode(to: string, code: string) {
    try {
      await this.transporter.sendMail({
        from: `"Spark" <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject: 'Відновлення пароля',
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Відновлення доступу</h2>
            <p>Ми отримали запит на скидання пароля для вашого акаунта.</p>
            <p>Ваш код підтвердження:</p>
            <h1 style="color: #E24A4A; letter-spacing: 5px;">${code}</h1>
            <p>Код дійсний протягом 15 хвилин. Нікому його не повідомляйте.</p>
          </div>
        `,
      });
      this.logger.log(`Email з кодом відновлення відправлено на ${to}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Помилка відправки email на ${to}`, errorMessage);
      throw new Error('Не вдалося відправити лист для відновлення пароля');
    }
  }
}