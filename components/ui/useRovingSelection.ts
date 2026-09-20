import { useRef, type KeyboardEvent } from "react";

// Roving tabindex for a role="radiogroup" or role="tablist" of buttons: arrow keys move focus and selection together, wrapping at the ends.
export function useRovingSelection<T>(options: readonly T[], onSelect: (option: T) => void) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusAndSelect(index: number) {
    const wrapped = (index + options.length) % options.length;
    onSelect(options[wrapped]);
    buttonRefs.current[wrapped]?.focus();
  }

  function registerButton(index: number) {
    return (el: HTMLButtonElement | null) => {
      buttonRefs.current[index] = el;
    };
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusAndSelect(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusAndSelect(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAndSelect(0);
        break;
      case "End":
        event.preventDefault();
        focusAndSelect(options.length - 1);
        break;
    }
  }

  return { registerButton, handleKeyDown };
}
