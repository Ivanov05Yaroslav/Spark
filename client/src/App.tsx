import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import MainLayout from './components/layout/MainLayout/MainLayout.tsx';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { useStore } from '@/stores/useStore.ts';

import { CoursePage, CoursesPage, EditCoursePage, CreateCoursePage } from './pages/courses';
import { ProfilePage } from './pages/profile';
import { AdminUserManagementPage } from '@/pages/administration';
import { CreateAnnouncementPage, EditAnnouncementPage } from '@/pages/announcements';
import {
  CreateTestPage,
  EditTestPage,
  TeacherTestDetailsPage,
  TestDetailsPage,
  TestExecutionPage,
} from '@/pages/tests';
import {
  CreateTaskPage,
  EditTaskPage,
  GeneralTaskDetailsPage,
  TeacherTaskDetailsPage,
} from '@/pages/tasks';

import {
  EmailVerificationPage as AuthEmailVerificationPage,
  ForgotPasswordPage,
  HeadmasterEmailVerificationPage,
  LoginPage,
  ParentCodePage,
  ParentDetailsPage,
  ParentEmailVerificationPage,
  ResetPasswordPage,
  SchoolSelectionPage,
  SchoolDetailsPage,
  SchoolDocumentsPage,
} from './pages/auth';
import { TestAttemptReviewPage } from '@/pages/tests/TestAttemptReviewPage/TestAttemptReviewPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/password/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/password/verify-email" element={<AuthEmailVerificationPage />} />
        <Route path="/password/reset-password" element={<ResetPasswordPage />} />

        <Route path="/parent/register/init" element={<ParentCodePage />} />
        <Route path="/parent/register/details" element={<ParentDetailsPage />} />
        <Route path="/parent/verify-email" element={<ParentEmailVerificationPage />} />

        <Route path="/school/register/init" element={<SchoolSelectionPage />} />
        <Route path="/school/register/details" element={<SchoolDetailsPage />} />
        <Route path="/school/verify-email" element={<HeadmasterEmailVerificationPage />} />
        <Route path="/school/register/submit" element={<SchoolDocumentsPage />} />

        <Route path="/" element={<MainLayout />}>
          <Route
            element={<ProtectedRoute allowedRoles={['STUDENT', 'PARENT', 'TEACHER', 'ADMIN']} />}
          >
            <Route index element={<Navigate to="/courses" replace />} />

            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CoursePage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/courses/:id/tasks/:taskId" element={<GeneralTaskDetailsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'PARENT']} />}>
            <Route path="/courses/:id/tests/:testId" element={<TestDetailsPage />} />
            <Route path="/courses/:id/tests/:testId/execute" element={<TestExecutionPage />} />
            <Route
              path="/courses/:id/tests/:testId/review/:attemptId"
              element={<TestAttemptReviewPage />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']} />}>
            <Route path="/courses/create" element={<CreateCoursePage />} />
            <Route path="/courses/:id/edit" element={<EditCoursePage />} />

            <Route
              path="/courses/:id/tasks/:taskId/submissions"
              element={<TeacherTaskDetailsPage />}
            />
            <Route path="/courses/:id/tasks/create" element={<CreateTaskPage />} />
            <Route path="/courses/:id/tasks/:taskId/edit" element={<EditTaskPage />} />

            <Route
              path="/courses/:id/tests/:testId/submissions"
              element={<TeacherTestDetailsPage />}
            />
            <Route path="/courses/:id/tests/create" element={<CreateTestPage />} />
            <Route path="/courses/:id/tests/:testId/edit" element={<EditTestPage />} />

            <Route path="/courses/:id/announcements/create" element={<CreateAnnouncementPage />} />
            <Route
              path="/courses/:id/announcements/:announcementId/edit"
              element={<EditAnnouncementPage />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminUserManagementPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
