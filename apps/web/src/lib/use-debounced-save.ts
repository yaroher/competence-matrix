import { useEffect, useRef } from 'react';

/**
 * Runs `save` after `delay` ms of no changes to `deps`. Skips the initial mount,
 * so it never fires just from rendering. The latest `save` closure is always used.
 */
export function useDebouncedSave(deps: readonly unknown[], save: () => void, delay = 700) {
  const first = useRef(true);
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => saveRef.current(), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}
