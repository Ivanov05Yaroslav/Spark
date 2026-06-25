import {
  CitiesResponseDto,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  InitSchoolRegistrationRequest,
  InitSchoolRegistrationResponse,
  LoginRequest,
  LoginResponse,
  ParentDetailsRequest,
  ParentDetailsResponse,
  ParentInitRequest,
  ParentInitResponse,
  RegionsResponseDto,
  ResendCodeRequest,
  ResendCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SchoolDetailsRequest,
  SchoolDetailsResponse,
  SchoolsResponseDto,
  SubmitSchoolDocsRequestDTO,
  SubmitSchoolDocsResponseDTO,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from '@/types/auth.types.ts';

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();

        throw new Error(errorData.message || 'Щось пішло не так');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await fetch(`${API_URL}/auth/password/forgot/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();

        throw new Error(errorData.message || 'Щось пішло не так');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },

  async verifyCode(data: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    const response = await fetch(`${API_URL}/auth/password/forgot/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Невірний код підтвердження');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await fetch(`${API_URL}/auth/password/forgot/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();

        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message[0]
          : errorData.message || 'Не вдалося оновити пароль';

        throw new Error(errorMessage);
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера');
      }
    }

    return response.json();
  },

  async resendCode(data: ResendCodeRequest): Promise<ResendCodeResponse> {
    const response = await fetch(`${API_URL}/auth/password/forgot/resend-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при повторній відправці коду');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },

  async getRegions(): Promise<RegionsResponseDto> {
    const response = await fetch(`${API_URL}/schools/regions`, {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при завантаженні областей');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },

  async getCities(region: string): Promise<CitiesResponseDto> {
    const params = new URLSearchParams({ region });
    const response = await fetch(`${API_URL}/schools/cities?${params.toString()}`, {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при завантаженні міст');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },

  async getSchools(city: string): Promise<SchoolsResponseDto> {
    const params = new URLSearchParams({ city });
    const response = await fetch(`${API_URL}/schools/list?${params.toString()}`, {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при завантаженні шкіл');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },

  async initSchoolRegistration(
    data: InitSchoolRegistrationRequest,
  ): Promise<InitSchoolRegistrationResponse> {
    const response = await fetch(`${API_URL}/auth/school/register/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при ініціалізації реєстрації школи');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },

  async registerSchoolDetails(data: SchoolDetailsRequest): Promise<SchoolDetailsResponse> {
    const response = await fetch(`${API_URL}/auth/school/register/details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message[0]
        : errorData.message;
      throw new Error(errorMessage || 'Помилка при збереженні даних директора');
    }

    return response.json();
  },

  async headmasterVerifyCode(data: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    const response = await fetch(`${API_URL}/auth/school/register/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Невірний код підтвердження');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },

  async headmasterResendCode(data: ResendCodeRequest): Promise<ResendCodeResponse> {
    const response = await fetch(`${API_URL}/auth/school/register/resend-email-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при повторній відправці коду');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },

  async submitDocuments(data: SubmitSchoolDocsRequestDTO): Promise<SubmitSchoolDocsResponseDTO> {
    const formData = new FormData();

    formData.append('sessionId', data.sessionId);

    data.passportDocs.forEach((file) => {
      formData.append('passportDocs', file);
    });

    if (data.edrDocs) {
      data.edrDocs.forEach((file) => formData.append('edrDocs', file));
    }

    if (data.appointmentOrderDocs) {
      data.appointmentOrderDocs.forEach((file) => formData.append('appointmentOrderDocs', file));
    }

    if (data.employmentContractDocs) {
      data.employmentContractDocs.forEach((file) =>
        formData.append('employmentContractDocs', file),
      );
    }

    const response = await fetch(`${API_URL}/auth/school/register/submit`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Щось пішло не так');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },

  async registerParentInit(data: ParentInitRequest): Promise<ParentInitResponse> {
    const response = await fetch(`${API_URL}/auth/parent/register/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message[0]
        : errorData.message;

      throw new Error(errorMessage || 'Помилка при ініціалізації реєстрації');
    }

    return response.json();
  },

  async registerParentDetails(data: ParentDetailsRequest): Promise<ParentDetailsResponse> {
    const response = await fetch(`${API_URL}/auth/parent/register/details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message[0]
        : errorData.message;
      throw new Error(errorMessage || 'Помилка при збереженні даних батьків');
    }

    return response.json();
  },

  async parentVerifyCode(data: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    const response = await fetch(`${API_URL}/auth/parent/register/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Невірний код підтвердження');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },

  async parentResendCode(data: ResendCodeRequest): Promise<ResendCodeResponse> {
    const response = await fetch(`${API_URL}/auth/parent/register/resend-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при повторній відправці коду');
      } catch (parseError: any) {
        throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
      }
    }

    return response.json();
  },
};
