// import { renderHook, act } from '@testing-library/react';
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { useCreateCourse } from './useCreateCourse';
//
// const mockNavigate = vi.fn();
// vi.mock('react-router-dom', () => ({
//     useNavigate: () => mockNavigate,
// }));
//
// vi.mock('@tanstack/react-query', () => ({
//     useMutation: vi.fn(() => ({
//         mutate: vi.fn(),
//         isPending: false,
//     })),
//     useQueryClient: vi.fn(() => ({
//         invalidateQueries: vi.fn(),
//     })),
// }));
//
// vi.mock('../hooks/useCourseData', () => ({
//     useCourseData: vi.fn(() => ({
//         subjectsQuery: { data: [], isLoading: false },
//         classesQuery: { data: [], isLoading: false },
//         teachersQuery: { data: [], isLoading: false },
//         studentsQuery: { data: [], isLoading: false },
//     })),
// }));
//
// describe('useCreateCourse Custom Hook (Unit Tests)', () => {
//
//     beforeEach(() => {
//         vi.clearAllMocks();
//     });
//
//     it('повинен ініціалізувати форму з дефолтними значеннями та невалідною формою', () => {
//         const { result } = renderHook(() => useCreateCourse());
//
//         expect(result.current.values.subject).toBe('');
//         expect(result.current.values.grade).toBe('');
//         expect(result.current.values.startDate).toBe('');
//         expect(result.current.values.endDate).toBe('');
//         expect(result.current.values.isDivided).toBe(false);
//         expect(result.current.values.isHidden).toBe(false);
//
//         expect(result.current.isFormValid).toBe(false);
//     });
//
//     it('повинен ставати валідним, коли заповнені всі обов’язкові базові поля', () => {
//         const { result } = renderHook(() => useCreateCourse());
//
//         act(() => {
//             result.current.handlers.setSubject('subject-id-123');
//             result.current.handlers.setGrade('class-id-456');
//             result.current.handlers.setStartDate('2026-09-01');
//             result.current.handlers.setEndDate('2027-05-31');
//         });
//
//         expect(result.current.isFormValid).toBe(true);
//     });
//
//     it('повинен вимагати номер групи та студентів, якщо увімкнено чекбокс "Розділити на групи"', () => {
//         const { result } = renderHook(() => useCreateCourse());
//
//         act(() => {
//             result.current.handlers.setSubject('subject-id-123');
//             result.current.handlers.setGrade('class-id-456');
//             result.current.handlers.setStartDate('2026-09-01');
//             result.current.handlers.setEndDate('2027-05-31');
//         });
//
//         act(() => {
//             result.current.handlers.handleIsDividedChange(true);
//         });
//
//         expect(result.current.isFormValid).toBe(false);
//
//         act(() => {
//             result.current.handlers.setGroupName('Група 1');
//         });
//         expect(result.current.isFormValid).toBe(false);
//
//         act(() => {
//             result.current.handlers.setStudents(['student-1', 'student-2']);
//         });
//
//         expect(result.current.isFormValid).toBe(true);
//     });
//
//     it('повинен очищувати дані групи, якщо користувач вимикає чекбокс "Розділити на групи"', () => {
//         const { result } = renderHook(() => useCreateCourse());
//
//         act(() => {
//             result.current.handlers.handleIsDividedChange(true);
//             result.current.handlers.setGroupName('2');
//             result.current.handlers.setStudents(['student-1']);
//         });
//
//         act(() => {
//             result.current.handlers.handleIsDividedChange(false);
//         });
//
//         expect(result.current.values.isDivided).toBe(false);
//         expect(result.current.values.groupName).toBe('');
//         expect(result.current.values.students).toEqual([]);
//     });
// });