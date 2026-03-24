import { Directive, ElementRef, OnInit, Renderer2, inject } from '@angular/core';

// PasswordToggleDirective — wraps a password input in a relative-positioned container
// and injects an eye-icon button that toggles between type="password" and type="text".
//
// Implemented as a directive (not a component) because the feature is a behaviour
// added to an existing element, not a new piece of UI. The directive finds the input,
// wraps it, and manages its own DOM — the template stays clean with just [appPasswordToggle].
//
// Why Renderer2 instead of direct DOM manipulation?
// Renderer2 is Angular's platform-safe DOM API. Direct el.nativeElement manipulation
// works in a browser but breaks in server-side rendering (SSR) and Web Workers.
// Renderer2 keeps the code portable without any extra effort.
@Directive({
  selector: '[appPasswordToggle]',
  standalone: true
})
export class PasswordToggleDirective implements OnInit {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  // Tracks visible/hidden state so the icon flips correctly on each click
  private visible = false;

  ngOnInit() {
    const input: HTMLInputElement = this.el.nativeElement;

    // We need a wrapper div with position:relative so the toggle button can sit
    // inside the input's right edge using position:absolute.
    // insertBefore puts the wrapper exactly where the input currently is in the DOM.
    const wrapper = this.renderer.createElement('div');
    this.renderer.setStyle(wrapper, 'position', 'relative');
    this.renderer.setStyle(wrapper, 'display', 'block');

    const parent = this.renderer.parentNode(input);
    this.renderer.insertBefore(parent, wrapper, input);
    this.renderer.appendChild(wrapper, input);

    // The toggle button sits inside the wrapper, vertically centred on the right side.
    // padding-right on the input (set below) stops text from sliding under the button.
    const btn = this.renderer.createElement('button');
    this.renderer.setAttribute(btn, 'type', 'button'); // type="button" prevents form submit
    this.renderer.setAttribute(btn, 'tabindex', '-1'); // skip in tab order — not a real field
    this.renderer.setAttribute(btn, 'aria-label', 'Toggle password visibility');
    this.renderer.setStyle(btn, 'position', 'absolute');
    this.renderer.setStyle(btn, 'right', '12px');
    this.renderer.setStyle(btn, 'top', '50%');
    this.renderer.setStyle(btn, 'transform', 'translateY(-50%)');
    this.renderer.setStyle(btn, 'background', 'none');
    this.renderer.setStyle(btn, 'border', 'none');
    this.renderer.setStyle(btn, 'cursor', 'pointer');
    this.renderer.setStyle(btn, 'padding', '0');
    this.renderer.setStyle(btn, 'line-height', '1');
    this.renderer.setStyle(btn, 'color', '#6b7280');
    this.renderer.setStyle(btn, 'font-size', '1.1rem');

    // Set icon to initial "closed eye" state (password is hidden)
    btn.innerHTML = this.eyeIcon(false);

    // Add enough right padding so typed text never slides under the toggle button
    this.renderer.setStyle(input, 'padding-right', '42px');

    // Click handler: flip visible flag, swap input type, swap icon
    this.renderer.listen(btn, 'click', () => {
      this.visible = !this.visible;
      // Switching type between 'text' and 'password' is what actually shows/hides chars.
      // We use setAttribute rather than .type = because some browsers throw a DOM exception
      // if you set .type on an input that's already in a form — setAttribute never throws.
      this.renderer.setAttribute(input, 'type', this.visible ? 'text' : 'password');
      btn.innerHTML = this.eyeIcon(this.visible);
    });

    this.renderer.appendChild(wrapper, btn);
  }

  // Returns an inline SVG eye icon — open when password is visible, closed (with slash)
  // when hidden. SVG avoids any dependency on an icon library.
  // viewBox="0 0 24 24" is the standard coordinate space for Material-style icons.
  private eyeIcon(visible: boolean): string {
    if (visible) {
      // Open eye: password is currently visible, clicking will hide it
      return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>`;
    }
    // Closed eye (with diagonal slash): password is hidden, clicking will show it
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>`;
  }
}
