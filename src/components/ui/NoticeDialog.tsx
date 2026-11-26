import React, { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface NoticeDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  buttonLabel?: string;
  onClose: () => void;
}

export const NoticeDialog: React.FC<NoticeDialogProps> = ({
  isOpen,
  title,
  message,
  buttonLabel = 'Got it',
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = React.useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Fallback for browsers without native `closedby="any"` (e.g. Safari)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };

    let pressedOutside = false;
    const handlePointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', handlePointerDown);
    dialog.addEventListener('pointerup', handlePointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', handlePointerDown);
      dialog.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const handleClose = () => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.returnValue = '';
    }
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handleClose}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 w-[calc(100%-2rem)] max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl border border-slate-200/90"
    >
      <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 border border-amber-200/80 flex items-center justify-center mb-3.5">
        <AlertCircle className="w-6 h-6 text-amber-700" />
      </div>

      <h1 id={titleId} className="text-base font-black text-slate-900">
        {title}
      </h1>

      <p className="text-xs font-medium text-slate-500 mt-1.5 leading-relaxed">
        {message}
      </p>

      <form method="dialog" className="mt-5">
        <button
          type="submit"
          autoFocus
          className="w-full py-3 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition shadow-xs cursor-pointer active:scale-[0.99]"
        >
          {buttonLabel}
        </button>
      </form>
    </dialog>
  );
};

export default NoticeDialog;
