// Toegankelijke dialoog op basis van het native <dialog>-element (focusval en Escape gratis).

import { useEffect, useRef, type ReactNode } from "react";
import { IconClose } from "./Icons";

type Props = { open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string };

export function Dialog({ open, onClose, title, children, className = "" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <>
          <button className="icon-btn dialog__close" type="button" onClick={onClose} aria-label="Sluiten">
            <IconClose />
          </button>
          <h2>{title}</h2>
          {children}
        </>
      )}
    </dialog>
  );
}
