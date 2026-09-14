import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { AppProviders } from "@/app/providers/AppProviders";
import { router } from "@/app/router";
import { Spinner } from "@/components/feedback/Spinner";

export function App() {
  return (
    <AppProviders>
      <Suspense fallback={<Spinner label="Loading Squat" />}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProviders>
  );
}
