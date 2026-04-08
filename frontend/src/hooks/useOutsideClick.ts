import { useRef, useEffect } from "react";

export function useOutsideClick<T extends HTMLElement>(
    active: boolean,
    onOutside: () => void
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!active) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onOutside();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [active, onOutside]);

    return ref;
}
