export function queryRequired<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector(selector) as T | null;

  if (!element) {
    throw new Error(`Expected element "${selector}" to exist.`);
  }

  return element;
}

export function typeText(root: ParentNode, selector: string, value: string) {
  const input = queryRequired<HTMLInputElement | HTMLTextAreaElement>(root, selector);
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return input;
}

export function clickSelector(root: ParentNode, selector: string) {
  const element = queryRequired<HTMLElement>(root, selector);
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  return element;
}

export function clickButtonByText(root: ParentNode, text: string) {
  const button = Array.from(root.querySelectorAll('button')).find(
    (candidate) => candidate.textContent?.includes(text),
  ) as HTMLButtonElement | undefined;

  if (!button) {
    throw new Error(`Expected a button containing "${text}" to exist.`);
  }

  button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  return button;
}
