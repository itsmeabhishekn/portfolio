import { Outlet } from "react-router-dom";
import styles from "./AuthShell.module.css";

export function AuthShell() {
  return (
    <div className={styles.shell}>
      <Outlet />
    </div>
  );
}
