import {BrowserRouter, Route, Routes} from "react-router-dom";
import MainLayout from "./components/layout/MainLayout/MainLayout.tsx";
import {CoursePage, CoursesPage, EditCoursePage} from "./pages/courses";
import {ProfilePage} from "./pages/profile";
import {
    EmailVerificationPage as AuthEmailVerificationPage,
    ForgotPasswordPage,
    LoginPage,
    ResetPasswordPage,
    ParentEmailVerificationPage,
    HeadmasterEmailVerificationPage,
    ParentCodePage,
    ParentDetailsPage, SchoolDetailsPage, SchoolSelectionPage, SchoolDocumentsPage,
} from "./pages/auth";
import React from "react";
import {ToastContainer} from "react-toastify";
import {CreateCoursePage} from "@/pages/courses";
// import {CreateAnnouncementPage, EditAnnouncementPage} from "@/features/announcements";
import {CreateTaskPage, EditTaskPage, GeneralTaskDetailsPage} from "@/pages/tasks";
import {CreateAnnouncementPage, EditAnnouncementPage} from "@/pages/announcements";
import {AdminUserManagementPage} from "@/pages/administration";
import {CreateTestPage, EditTestPage, TestExecutionPage} from "@/pages/tests";

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
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/courses/create" element={<CreateCoursePage />} />
                    <Route path="/courses/:id/edit" element={<EditCoursePage />} />
                    <Route path="/courses/:id" element={<CoursePage />} />

                    <Route path="/courses/:id/tasks/create" element={<CreateTaskPage />} />
                    <Route path="/courses/:id/tasks/:taskId" element={<GeneralTaskDetailsPage />} />
                    {/*<Route path="/courses/:id/tasks/:taskId" element={<TeacherTaskDetailsPage />} />*/}
                    <Route path="/courses/:id/tasks/:taskId/edit" element={<EditTaskPage />} />

                    <Route path="/courses/:id/tests/create" element={<CreateTestPage />} />
                    <Route path="/courses/:id/tests/:testId/edit" element={<EditTestPage />} />
                    <Route path="/courses/:id/tests/:testId/execution" element={<TestExecutionPage />} />

                    <Route path="/courses/:id/announcements/create" element={<CreateAnnouncementPage />} />
                    <Route path="/courses/:id/announcements/:announcementId/edit" element={<EditAnnouncementPage />} />

                    <Route path="/admin" element={<AdminUserManagementPage />} />



                    {/*<Route path="/chats" element={<Chats />} />*/}
                    <Route path="/profile" element={<ProfilePage />} />
                    {/*<Route path="/statistics" element={<Statistics />} />*/}
                    {/*<Route path="/admin" element={<Admin />} />*/}
                    {/*<Route path="/course" element={<Course />} />*/}
                    {/*<Route path="/create-course" element={<CreateCourse />} />*/}
                    {/*<Route path="/edit-course" element={<EditCoursePage />} />*/}
                    {/*<Route path="/task" element={<Task />} />*/}
                    {/*<Route path="/create-task" element={<CreateTask />} />*/}
                    {/*<Route path="/edit-task" element={<EditTask />} />*/}
                    {/*<Route path="/test" element={<Test />} />*/}
                    {/*<Route path="/create-test" element={<CreateTest />} />*/}
                    {/*<Route path="/edit-test" element={<EditTest />} />*/}
                    {/*<Route path="/take-test" element={<TakeTest />} />*/}
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App
