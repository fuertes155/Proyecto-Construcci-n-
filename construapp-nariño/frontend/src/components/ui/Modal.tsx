import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import clsx from 'clsx';
import { useRef, type ReactNode } from 'react';
import { PiX } from 'react-icons/pi';
import { IconButton } from './Button';

const SIZE_CLASS = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-2xl',
} as const;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  size?: keyof typeof SIZE_CLASS;
  children: ReactNode;
}

/**
 * Diálogo modal accesible (foco atrapado, Esc y clic fuera para cerrar).
 * En móvil se presenta como hoja inferior; en escritorio, centrado.
 * Marca con `data-autofocus` el control que debe recibir el foco al abrir.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
}: ModalProps) {
  // Conserva el último contenido mientras dura la animación de cierre, cuando
  // quien lo abre ya limpió su estado (p. ej. el elemento en edición).
  const latched = useRef({ title, description, children });
  if (open) latched.current = { title, description, children };
  const view = latched.current;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/55 backdrop-blur-[2px] transition duration-200 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center sm:items-center sm:p-6">
          <DialogPanel
            transition
            className={clsx(
              'w-full rounded-t-xl border border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-overlay transition duration-200 ease-out data-[closed]:translate-y-4 data-[closed]:opacity-0 sm:rounded-xl',
              SIZE_CLASS[size]
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <DialogTitle className="font-display text-2xl font-semibold leading-tight text-ink">
                  {view.title}
                </DialogTitle>
                {view.description && (
                  <Description className="mt-1 text-sm text-ink-muted">
                    {view.description}
                  </Description>
                )}
              </div>
              <IconButton label="Cerrar" onClick={onClose} className="-mr-2 -mt-1">
                <PiX aria-hidden="true" />
              </IconButton>
            </div>
            <div className="px-5 py-5 sm:px-6">{view.children}</div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
