import { useCallback, useEffect, useRef, useState } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared open/close choreography for the app's overlay modals: mounts with a
 * fade+scale-in on the next frame, dismisses with a matching fade-out before
 * unmounting, closes on Escape, traps Tab focus inside the panel, and returns
 * focus to whatever triggered the modal.
 */
export function useDismissableModal(open: boolean, onClose: () => void, exitDurationMs = 200) {
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement as HTMLElement;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open || !visible) return;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  }, [open, visible]);

  // `action` lets a modal with multiple exits (e.g. confirm vs. cancel) play the
  // same fade-out for either one while still defaulting to `onClose` for Escape/backdrop.
  const dismiss = useCallback((action?: () => void) => {
    setVisible(false);
    setTimeout(() => {
      (action ?? onClose)();
      triggerRef.current?.focus?.();
    }, exitDurationMs);
  }, [onClose, exitDurationMs]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        dismiss();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, dismiss]);

  return { visible, dismiss, panelRef };
}
