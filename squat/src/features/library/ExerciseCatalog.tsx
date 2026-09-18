import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui";
import { paths } from "@/config/paths";
import {
  formatEquipment,
  groupExercisesByRegion,
} from "@/lib/workoutMeta";
import type { Exercise } from "@/types/domain";
import styles from "./library.module.css";

export function ExerciseCatalog({
  exercises,
}: {
  exercises: readonly Exercise[];
}) {
  if (exercises.length === 0) {
    return (
      <EmptyState
        title="No exercises"
        body="The catalog is empty until the taxonomy is imported."
      />
    );
  }

  const regions = groupExercisesByRegion(exercises);

  return (
    <div className={styles.catalog}>
      {regions.map((region) => {
        const count = region.groups.reduce(
          (sum, group) => sum + group.exercises.length,
          0,
        );
        return (
          <section key={region.region} className={styles.region}>
            <header className={styles.regionHeader}>
              <h2 className={styles.regionTitle}>{region.region}</h2>
              <p className="t-meta">
                {count} {count === 1 ? "lift" : "lifts"}
              </p>
            </header>
            {region.groups.map((group) => {
              const showFocus =
                region.groups.length > 1 || group.focus !== region.region;
              return (
                <div key={group.focus} className={styles.focus}>
                  {showFocus ? (
                    <h3 className={styles.focusTitle}>{group.focus}</h3>
                  ) : null}
                  <ul className={styles.lifts}>
                    {group.exercises.map((exercise) => (
                      <li key={exercise.id}>
                        <Link
                          className={styles.lift}
                          to={paths.exercise(exercise.id)}
                        >
                          <span className={styles.liftName}>{exercise.name}</span>
                          <span className={styles.liftMeta}>
                            {formatEquipment(exercise.equipment)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
