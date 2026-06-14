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

  private async sendMail(to: string, subject: string, htmlContent: string) {
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body, table, td, p, h1, h2, h3, span {
            font-family: 'Inter', sans-serif !important;
            line-height: 121.9% !important;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #ffffff; text-align: center;">
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; table-layout: fixed;">
          <tr>
            <td align="center" valign="middle" style="text-align: center;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 1266px; height: 391px; background-color: rgba(112, 45, 255, 0.2); border-radius: 16px; border-collapse: separate; overflow: hidden; margin: 0 auto; text-align: center;">
                <tr>
                  <td align="center" valign="middle" style="padding: 30px 40px; text-align: center;">
                    ${htmlContent}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Spark" <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        html: fullHtml,
      });
      this.logger.log(`Email '${subject}' відправлено на ${to}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Помилка відправки email на ${to}`, errorMessage);
      throw new Error(`Не вдалося відправити лист: ${subject}`);
    }
  }

  // 1. Лист створення профілю
  async sendWelcomeEmail(to: string, plainPassword: string) {
    const html = `
      <h2 style="color: #702DFF; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">Вітаємо на платформі <u style="text-decoration: underline;">Spark</u>!</h2>
      
      <p style="color: #000000; font-size: 16px; font-weight: 400; margin: 0 auto 10px auto; text-align: center;">Адміністратор успішно створив для вас профіль навчального закладу.</p>
      <p style="color: #000000; font-size: 16px; font-weight: 400; margin: 0 auto 25px auto; text-align: center;">Ваші дані для першого входу в систему:</p>
      
      <table align="center" width="768" height="120" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 768px; height: 120px; background-color: rgba(112, 45, 255, 0.1); border: 1px solid #702DFF; border-radius: 8px; border-collapse: separate; margin: 0 auto 25px auto; text-align: center;">
        <tr>
          <td align="center" valign="middle" style="text-align: center; padding: 10px 20px;">
            <p style="margin: 0 0 12px 0; text-align: center;">
              <span style="color: #702DFF; font-weight: 700; font-size: 16px;">Email (Логін):</span> 
              <span style="color: #000000; font-weight: 400; font-size: 16px; margin-left: 5px;">${to}</span>
            </p>
            <p style="margin: 0; text-align: center;">
              <span style="color: #702DFF; font-weight: 700; font-size: 16px;">Пароль:</span> 
              <span style="color: #000000; font-weight: 400; font-size: 16px; margin-left: 5px;">${plainPassword}</span>
            </p>
          </td>
        </tr>
      </table>
      
      <p style="color: #9F0712; font-size: 16px; font-weight: 500; text-align: center; margin: 0 auto;">
        Увага: Після першого успішного входу в систему вам буде необхідно змінити цей пароль на новий з міркувань безпеки!<span style="display:none !important; max-height:0; overflow:hidden; font-size:0;">${Date.now()}</span>
      </p>
    `;
    await this.sendMail(to, 'Ваш акаунт створено', html);
  }

  // 2. Код підтвердження реєстрації
  async sendVerificationCode(to: string, code: string) {
    const html = `
      <h2 style="color: #702DFF; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">Підтвердження електронної пошти</h2>
      
      <p style="color: #000000; font-size: 16px; font-weight: 400; margin: 0 auto 10px auto; text-align: center;">Ви розпочали реєстрацію навчального закладу на платформі.</p>
      <p style="color: #000000; font-size: 16px; font-weight: 400; margin: 0 auto 25px auto; text-align: center;">Ваш код підтвердження:</p>
      
      <table align="center" width="768" height="120" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 768px; height: 120px; background-color: rgba(112, 45, 255, 0.1); border: 1px solid #702DFF; border-radius: 8px; border-collapse: separate; margin: 0 auto 25px auto; text-align: center;">
        <tr>
          <td align="center" valign="middle" style="text-align: center; padding: 10px 20px;">
            <p style="margin: 0; text-align: center;">
              <span style="color: #702DFF; font-weight: 700; font-size: 36px; letter-spacing: 2px;">${code}</span>
            </p>
          </td>
        </tr>
      </table>
      
      <p style="color: #000000; font-size: 16px; font-weight: 400; text-align: center; margin: 0 auto;">
        Код дійсний протягом 15 хвилин. Нікому його не повідомляйте!<span style="display:none !important; max-height:0; overflow:hidden; font-size:0;">${Date.now()}</span>
      </p>
    `;
    await this.sendMail(to, 'Код підтвердження реєстрації', html);
  }

  // 3. Код відновлення пароля
  async sendPasswordResetCode(to: string, code: string) {
    const html = `
      <h2 style="color: #702DFF; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">Відновлення доступу</h2>
      
      <p style="color: #000000; font-size: 16px; font-weight: 400; margin: 0 auto 10px auto; text-align: center;">Ми отримали запит на скидання пароля для вашого акаунта.</p>
      <p style="color: #000000; font-size: 16px; font-weight: 400; margin: 0 auto 25px auto; text-align: center;">Ваш код підтвердження:</p>
      
      <table align="center" width="768" height="120" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 768px; height: 120px; background-color: rgba(112, 45, 255, 0.1); border: 1px solid #702DFF; border-radius: 8px; border-collapse: separate; margin: 0 auto 25px auto; text-align: center;">
        <tr>
          <td align="center" valign="middle" style="text-align: center; padding: 10px 20px;">
            <p style="margin: 0; text-align: center;">
              <span style="color: #702DFF; font-weight: 700; font-size: 36px; letter-spacing: 2px;">${code}</span>
            </p>
          </td>
        </tr>
      </table>
      
      <p style="color: #000000; font-size: 16px; font-weight: 400; text-align: center; margin: 0 auto;">
        Код дійсний протягом 15 хвилин. Нікому його не повідомляйте!<span style="display:none !important; max-height:0; overflow:hidden; font-size:0;">${Date.now()}</span>
      </p>
    `;
    await this.sendMail(to, 'Код відновлення пароля', html);
  }

  // 4. Заявку схвалено
  async sendApprovalEmail(email: string) {
    const html = `
      <h2 style="color: #702DFF; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">Заявку схвалено на платформі <u style="text-decoration: underline;">Spark</u>!</h2>
      
      <p style="color: #000000; font-size: 16px; font-weight: 400; margin: 0 auto 10px auto; text-align: center;">Вітаємо! Вашу заявку на реєстрацію закладу освіти успішно схвалено адміністратором.</p>
      <p style="color: #000000; font-size: 16px; font-weight: 400; margin: 0 auto 25px auto; text-align: center;">Ваші дані готові для роботи.</p>
      
      <table align="center" width="768" height="120" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 768px; height: 120px; background-color: rgba(112, 45, 255, 0.1); border: 1px solid #702DFF; border-radius: 8px; border-collapse: separate; margin: 0 auto; text-align: center;">
        <tr>
          <td align="center" valign="middle" style="text-align: center; padding: 10px 20px;">
            <p style="color: #000000; font-weight: 400; font-size: 16px; text-align: center; margin: 0;">
              Ви можете увійти в систему, використовуючи вказаний при реєстрації Email та створений вами пароль.<span style="display:none !important; max-height:0; overflow:hidden; font-size:0;">${Date.now()}</span>
            </p>
          </td>
        </tr>
      </table>
    `;
    await this.sendMail(email, 'Заявка на реєстрацію школи схвалена!', html);
  }

  // 5. Заявку відхилено
  async sendRejectionEmail(email: string, reason: string) {
    const html = `
      <h2 style="color: #702DFF; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">Заявку відхилено на платформі <u style="text-decoration: underline;">Spark</u>!</h2>
      
      <p style="color: #000000; font-size: 16px; font-weight: 400; margin: 0 auto 10px auto; text-align: center;">На жаль, вашу заявку на реєстрацію закладу освіти було відхилено адміністратором.</p>
      <p style="color: #000000; font-size: 16px; font-weight: 400; margin: 0 auto 25px auto; text-align: center;">Деталі вказані нижче:</p>
      
      <table align="center" width="768" height="120" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 768px; height: 120px; background-color: rgba(112, 45, 255, 0.1); border: 1px solid #702DFF; border-radius: 8px; border-collapse: separate; margin: 0 auto 25px auto; text-align: center;">
        <tr>
          <td align="center" valign="middle" style="text-align: center; padding: 10px 20px;">
            <p style="margin-bottom: 10px; text-align: center;">
              <span style="color: #702DFF; font-weight: 700; font-size: 16px;">Причина відхилення:</span> 
            </p>
            <p style="color: #000000; font-weight: 400; font-size: 16px; text-align: center; margin: 0;">
              ${reason}
            </p>
          </td>
        </tr>
      </table>
      
      <p style="color: #9F0712; font-size: 16px; font-weight: 500; text-align: center; margin: 0 auto;">
        Увага: Ви можете подати заявку повторно, виправивши вказані недоліки у документах!<span style="display:none !important; max-height:0; overflow:hidden; font-size:0;">${Date.now()}</span>
      </p>
    `;
    await this.sendMail(email, 'Відхилення заявки на реєстрацію школи', html);
  }
}
