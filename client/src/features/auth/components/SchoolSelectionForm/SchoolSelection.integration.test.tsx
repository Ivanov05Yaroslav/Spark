// // <reference types="vitest" />
// import 'vitest';
// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { BrowserRouter } from 'react-router-dom';
// import { SchoolSelectionForm } from './SchoolSelectionForm';
// import { authService } from '@/api/auth.service';
// import { toast } from '@/libs/configs/Toast';
//
// // 1. Мокаємо сервіси API та Toast
// vi.mock('@/api/auth.service.ts', () => ({
//     authService: {
//         getRegions: vi.fn(),
//         getCities: vi.fn(),
//         getSchools: vi.fn(),
//         initSchoolRegistration: vi.fn(),
//     },
// }));
//
// vi.mock('@/libs/configs/Toast.ts', () => ({
//     toast: {
//         success: vi.fn(),
//         error: vi.fn(),
//     },
// }));
//
// // Мокаємо useNavigate
// const mockNavigate = vi.fn();
// vi.mock('react-router-dom', async () => {
//     const actual = await vi.importActual('react-router-dom');
//     return {
//         ...actual,
//         useNavigate: () => mockNavigate,
//     };
// });
//
// // Функція для створення чистого QueryClient перед кожним тестом
// const createTestQueryClient = () => new QueryClient({
//     defaultOptions: {
//         queries: { retry: false },
//     },
// });
//
// describe('School Registration - Step 1 Integration Test', () => {
//     beforeEach(() => {
//         vi.clearAllMocks();
//     });
//
//     it('повинен успішно провести користувача по всьому ланцюжку вибору закладу з ЄДЕБО та відправити форму', async () => {
//         // Імітуємо відповіді від бекенду
//         vi.mocked(authService.getRegions).mockResolvedValue(['Київська область', 'Львівська область']);
//         vi.mocked(authService.getCities).mockResolvedValue(['м. Біла Церква', 'м. Бровари']);
//         vi.mocked(authService.getSchools).mockResolvedValue([
//             { edeboId: '12345', fullName: 'Білоцерківський ліцей №1' },
//             { edeboId: '67890', fullName: 'Білоцерківська гімназія №5' }
//         ]);
//         vi.mocked(authService.initSchoolRegistration).mockResolvedValue({
//             message: 'Школу успішно обрано!',
//             sessionId: 'test-session-xyz-123'
//         });
//
//         const queryClient = createTestQueryClient();
//         render(
//             <QueryClientProvider client={queryClient}>
//                 <BrowserRouter>
//                     <SchoolSelectionForm />
//                 </BrowserRouter>
//             </QueryClientProvider>
//         );
//
//         // 1. Перевіряємо початковий стан
//         expect(screen.getByText(/ЗАЯВКА НА РЕЄСТРАЦІЮ ШКОЛИ/i)).toBeInTheDocument();
//
//         await waitFor(() => {
//             expect(authService.getRegions).toHaveBeenCalledTimes(1);
//         });
//
//         // 2. Симулюємо вибір області (клікаємо по плейсхолдеру, потім по опції)
//         fireEvent.click(screen.getByText('Оберіть область')); // Відкриваємо дропдаун
//         fireEvent.click(screen.getByText('Київська область')); // Обираємо пункт
//
//         await waitFor(() => {
//             expect(authService.getCities).toHaveBeenCalledWith('Київська область');
//         });
//
//         // 3. Симулюємо вибір населеного пункту
//         fireEvent.click(screen.getByText('Оберіть населений пункт'));
//         fireEvent.click(screen.getByText('м. Біла Церква'));
//
//         await waitFor(() => {
//             expect(authService.getSchools).toHaveBeenCalledWith('м. Біла Церква');
//         });
//
//         // 4. Симулюємо вибір навчального закладу (клікаємо саме на label, який відображається юзеру)
//         fireEvent.click(screen.getByText('Оберіть заклад'));
//         fireEvent.click(screen.getByText('Білоцерківський ліцей №1'));
//
//         // 5. Відправка форми
//         const submitButton = screen.getByRole('button', { name: /ДАЛІ/i });
//         fireEvent.click(submitButton);
//
//         // 6. Перевірка результату
//         await waitFor(() => {
//             // Перевіряємо, що на сервер відправився edeboId, а не назва
//             expect(authService.initSchoolRegistration).toHaveBeenCalledWith({ edeboId: '12345' });
//         });
//
//         expect(toast.success).toHaveBeenCalledWith('Школу успішно обрано!');
//
//         await waitFor(() => {
//             expect(mockNavigate).toHaveBeenCalledWith('/school/register/details?sessionId=test-session-xyz-123');
//         }, { timeout: 1500 });
//     });
//
//     it('повинен заблокувати підлеглі селекти та очистити їх значення при зміні батьківського поля', async () => {
//         vi.mocked(authService.getRegions).mockResolvedValue(['Київська область', 'Львівська область']);
//         vi.mocked(authService.getCities).mockResolvedValue(['м. Бровари']);
//
//         const queryClient = createTestQueryClient();
//         render(
//             <QueryClientProvider client={queryClient}>
//                 <BrowserRouter>
//                     <SchoolSelectionForm />
//                 </BrowserRouter>
//             </QueryClientProvider>
//         );
//
//         await waitFor(() => expect(authService.getRegions).toHaveBeenCalled());
//
//         fireEvent.click(screen.getByText('Оберіть область'));
//         fireEvent.click(screen.getByText('Київська область'));
//
//         // Чекаємо завантаження міст і вибираємо місто
//         await waitFor(() => expect(authService.getCities).toHaveBeenCalledWith('Київська область'));
//         fireEvent.click(screen.getByText('Оберіть населений пункт'));
//         fireEvent.click(screen.getByText('м. Бровари'));
//
//         // Тепер користувач міняє область на іншу
//         // Текст кнопки зараз "Київська область", бо вона обрана
//         fireEvent.click(screen.getByText('Київська область'));
//         fireEvent.click(screen.getByText('Львівська область'));
//
//         // Перевіряємо, що селекти заблокувались (знаходимо їх кнопки-тригери за текстом плейсхолдера)
//         // Твій компонент Select додає атрибут disabled на button
//         const cityButton = screen.getByText('Оберіть населений пункт').closest('button');
//         const schoolButton = screen.getByText('Оберіть заклад').closest('button');
//
//         expect(cityButton).toBeDisabled();
//         expect(schoolButton).toBeDisabled();
//     });
// });