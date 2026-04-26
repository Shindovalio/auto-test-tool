export function emulateClick(el: Element): void {
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const eventInit: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
    screenX: x,
    screenY: y,
  };

  el.dispatchEvent(new MouseEvent("mousedown", eventInit));
  el.dispatchEvent(new MouseEvent("mouseup", eventInit));
  el.dispatchEvent(new MouseEvent("click", eventInit));
}

export function emulateInput(el: Element, value: string): void {
  const input = el as HTMLInputElement | HTMLTextAreaElement;

  // Set native value via descriptor to bypass React's controlled input tracking
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(input),
    "value"
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value);
  } else {
    input.value = value;
  }

  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}
