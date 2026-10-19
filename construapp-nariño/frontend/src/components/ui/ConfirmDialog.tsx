import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useRef, type ReactNode } from 'react';
import { PiWarningFill } from 'react-icons/pi';
import Button from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** La acción está en curso: bloquea los botones y muestra actividad. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmación para acciones destructivas. El foco inicial queda en "Cancelar". */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Mantiene el texto durante la animación de cierre (ver Modal).
  const latched = useRef({ title, description, confirmLabel });
  if (open) latched.current = { title, description, confirmLabel };
  const view = latched.current;

  return (
    <Dialog
      open={open}
      onClose={loading ? () => undefined : onCancel}
      role="alertdialog"
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/55 backdrop-blur-[2px] transition duration-200 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center sm:items-center sm:p-6">
          <DialogPanel
            transition
            className="w-full rounded-t-xl border border-line bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-overlay transition duration-200 ease-out data-[closed]:translate-y-4 data-[closed]:opacity-0 sm:max-w-md sm:rounded-xl sm:p-6"
          >
            <div className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger-text"
              >
                <PiWarningFill className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="font-display text-2xl font-semibold leading-tight text-ink">
                  {view.title}
                </DialogTitle>
                <Description className="mt-2 text-ink-muted">{view.description}</Description>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={onCancel} disabled={loading} data-autofocus>
                {cancelLabel}
              </Button>
              <Button variant="danger" onClick={onConfirm} loading={loading}>
                {view.confirmLabel}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
