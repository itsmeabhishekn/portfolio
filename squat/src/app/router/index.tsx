import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/app/layout/AppShell";
import { AuthShell } from "@/app/layout/AuthShell";
import { RequireAuth } from "@/app/router/RequireAuth";
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
      ],
    },
    {
      element: <RequireAuth />,
      children: [
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
              path: "library",
              lazy: async () => {
                const { LibraryPage } = await import("@/pages/LibraryPage");
                return { Component: LibraryPage };
              },
            },
            {
              path: "programs",
              element: (
                <Navigate to={`${paths.library}?tab=programs`} replace />
              ),
            },
            {
              path: "programs/:programId",
              lazy: async () => {
                const { ProgramDetailPage } = await import(
                  "@/pages/ProgramPages"
                );
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
                const { WorkoutSessionPage } = await import(
                  "@/pages/WorkoutPages"
                );
                return { Component: WorkoutSessionPage };
              },
            },
            {
              path: "exercises",
              element: (
                <Navigate to={`${paths.library}?tab=exercises`} replace />
              ),
            },
            {
              path: "exercises/:exerciseId",
              lazy: async () => {
                const { ExerciseDetailPage } = await import(
                  "@/pages/ExercisePages"
                );
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
              element: (
                <Navigate to={`${paths.progress}?tab=sessions`} replace />
              ),
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
    },
  ],
  { basename },
);
