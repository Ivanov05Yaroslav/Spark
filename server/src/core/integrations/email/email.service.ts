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
      secure: process.env.SMTP_PORT === '465', // true для 465, false для інших портів
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

async sendVerificationCode(to: string, code: string) {
    try {
      await this.transporter.sendMail({
        from: `"Spark" <${process.env.SMTP_USER}>`, 
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
    } catch (error) {
      this.logger.error(`Помилка відправки email на ${to}`, error.message);
      throw new Error('Не вдалося відправити лист з кодом підтвердження');
    }
  }
}