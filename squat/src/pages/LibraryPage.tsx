import { useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/feedback/Spinner";
import { PageHeader, Tabs } from "@/components/ui";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { ExerciseCatalog } from "@/features/library/ExerciseCatalog";
import { ProgramList } from "@/features/library/ProgramList";
import { WorkoutList } from "@/features/library/WorkoutList";
import { api } from "@/services/api";
import styles from "./pages.module.css";

type LibraryTab = "programs" | "workouts" | "exercises";

const TABS: readonly LibraryTab[] = ["programs", "workouts", "exercises"];

function parseTab(value: string | null): LibraryTab {
  return TABS.find((tab) => tab === value) ?? "exercises";
}

async function loadLibrary() {
  const [programs, workouts, exercises] = await Promise.all([
    api.programs.listPrograms(),
    api.workouts.listWorkouts(),
    api.exercises.listExercises(),
  ]);
  return { programs, workouts, exercises };
}

export function LibraryPage() {
  const [params, setParams] = useSearchParams();
  const tab = parseTab(params.get("tab"));
  const { data, error, loading } = useAsyncValue(loadLibrary);

  if (loading) {
    return <Spinner label="Loading library" />;
  }

  if (error || !data) {
    return <p className={styles.error}>{error?.message ?? "Could not load library."}</p>;
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow="Library"
        title="Training"
        description="Programs you follow, the days in those programs, and the shared lift catalog."
      />
      <Tabs
        label="Library"
        value={tab}
        onChange={(next) => setParams({ tab: next }, { replace: true })}
        items={[
          {
            id: "programs",
            label: "Programs",
            panel: <ProgramList programs={data.programs} />,
          },
          {
            id: "workouts",
            label: "Workouts",
            panel: <WorkoutList workouts={data.workouts} />,
          },
          {
            id: "exercises",
            label: "Exercises",
            panel: <ExerciseCatalog exercises={data.exercises} />,
          },
        ]}
      />
    </div>
  );
}
