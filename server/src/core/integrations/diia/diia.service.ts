import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DiiaIntegrationService {
  private readonly logger = new Logger(DiiaIntegrationService.name);

  // Генеруємо посилання, на яке фронтенд перенаправить директора для підпису
  generateAuthUrl(sessionId: string): string {
    return `https://mock-diia.gov.ua/auth?session=${sessionId}`;
  }

  // Імітація розшифровки токена Дії
  async getUserDataFromToken(diiaToken: string): Promise<{ fullName: string; rnokpp: string }> {
    this.logger.log(`Декодування токена Дії: ${diiaToken}`);

    if (diiaToken.includes('error')) {
      throw new Error('Дія.Підпис не накладено або скасовано користувачем');
    }

    // Дозволяємо фронтенду передавати тестове ПІБ у самому токені
    // Формат: "mock_token_Ковальова Світлана Михайлівна"
    const mockFullName = diiaToken.replace('mock_token_', '').trim();

    return {
      fullName: mockFullName || 'Ковальова Світлана Михайлівна', // Дефолтне ім'я з нашого прикладу
      rnokpp: '1234567890', // ІПН
    };
  }
}
