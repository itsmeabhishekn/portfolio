import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/cx";
import styles from "./Overlay.module.css";

interface OverlayProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  sheet?: boolean;
}

function Overlay({ title, open, onClose, children, sheet = false }: OverlayProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className={cx(styles.layer, sheet && styles.sheetLayer)}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="overlay-title"
        className={cx(
          styles.dialog,
          styles.glassChrome,
          sheet && styles.sheet,
        )}
      >
        {sheet ? <div className={styles.handle} /> : null}
        <h2 id="overlay-title" className={`t-section ${styles.title}`}>
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal(props: ModalProps) {
  return <Overlay {...props} />;
}

export function BottomSheet(props: ModalProps) {
  return <Overlay {...props} sheet />;
}
