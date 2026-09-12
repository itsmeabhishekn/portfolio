import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/app/layout/AppShell";
import { AuthShell } from "@/app/layout/AuthShell";
import { paths } from "@/config/paths";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export const router = createBrowserRouter(
  [
    {
      element: <AuthShell />,
      children: [
        {
          path: "login",
          lazy: async () => {
            const { LoginPage } = await import("@/pages/AuthPages");
            return { Component: LoginPage };
          },
        },
        {
          path: "register",
          lazy: async () => {
            const { RegisterPage } = await import("@/pages/AuthPages");
            return { Component: RegisterPage };
          },
        },
      ],
    },
    {
      element: <AppShell />,
      children: [
        { index: true, element: <Navigate to={paths.dashboard} replace /> },
        {
          path: "dashboard",
          lazy: async () => {
            const { DashboardPage } = await import(
              "@/features/dashboard/DashboardPage"
            );
            return { Component: DashboardPage };
          },
        },
        {
          path: "programs",
          lazy: async () => {
            const { ProgramsPage } = await import("@/pages/ProgramPages");
            return { Component: ProgramsPage };
          },
        },
        {
          path: "programs/:programId",
          lazy: async () => {
            const { ProgramDetailPage } = await import("@/pages/ProgramPages");
            return { Component: ProgramDetailPage };
          },
        },
        {
          path: "workouts/:workoutId",
          lazy: async () => {
            const { WorkoutTemplatePage } = await import(
              "@/features/workouts/WorkoutTemplatePage"
            );
            return { Component: WorkoutTemplatePage };
          },
        },
        {
          path: "workout/:sessionId",
          lazy: async () => {
            const { WorkoutSessionPage } = await import("@/pages/WorkoutPages");
            return { Component: WorkoutSessionPage };
          },
        },
        {
          path: "exercises",
          lazy: async () => {
            const { ExercisesPage } = await import("@/pages/ExercisePages");
            return { Component: ExercisesPage };
          },
        },
        {
          path: "exercises/:exerciseId",
          lazy: async () => {
            const { ExerciseDetailPage } = await import("@/pages/ExercisePages");
            return { Component: ExerciseDetailPage };
          },
        },
        {
          path: "progress",
          lazy: async () => {
            const { ProgressPage } = await import("@/pages/ProgressPage");
            return { Component: ProgressPage };
          },
        },
        {
          path: "history",
          lazy: async () => {
            const { HistoryPage } = await import("@/pages/HistoryPage");
            return { Component: HistoryPage };
          },
        },
        {
          path: "profile",
          lazy: async () => {
            const { ProfilePage } = await import("@/pages/ProfilePage");
            return { Component: ProfilePage };
          },
        },
        {
          path: "*",
          lazy: async () => {
            const { NotFoundPage } = await import("@/pages/AuthPages");
            return { Component: NotFoundPage };
          },
        },
      ],
    },
  ],
  { basename },
);
