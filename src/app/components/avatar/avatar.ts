import { Component, Input, ViewEncapsulation } from '@angular/core';

// AvatarComponent: renders the circular letter-avatar used on posts and the create-post box.
// Extracted into its own component specifically to demonstrate ViewEncapsulation.ShadowDom.
//
// ShadowDom uses the browser's native Shadow DOM API to create a hard style boundary:
//   - Styles defined here CANNOT be overridden from outside (parent CSS is blocked)
//   - Global styles (Bootstrap, app-level CSS) CANNOT reach inside this component
//   - The component is fully self-contained — it owns 100% of its own appearance
//
// This is the right choice for a pure presentational atom like an avatar because:
//   1. It has no dependency on Bootstrap or any global class — all styles are self-contained
//   2. It should look identical everywhere it appears regardless of the host component's theme
//   3. It demonstrates the contrast with Emulated (HomeComponent) and None (ToastComponent)
//
// Contrast with the other two modes in this project:
//   Emulated (HomeComponent)  → Angular fakes scoping with attribute selectors in the DOM
//   None     (ToastComponent) → no scoping at all, styles injected globally into <head>
//   ShadowDom (this)          → browser-native hard boundary, true encapsulation
@Component({
  selector: 'app-avatar',
  standalone: true,
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `<div class="avatar-circle">{{ initial }}</div>`,
  styles: [`
    /* These styles live inside the Shadow DOM — no external CSS can override them,
       and they cannot leak out to affect anything outside this component */
    .avatar-circle {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1877f2, #0d6efd);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.1rem;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(24, 119, 242, 0.3);
      /* margin-right handled by the host via :host so the parent can control spacing */
    }

    /* :host targets the <app-avatar> element itself from inside the Shadow DOM —
       this is how you style the component's outer element when ShadowDom is active */
    :host {
      display: block;
      margin-right: 12px;
      flex-shrink: 0;
    }
  `]
})
export class AvatarComponent {
  // Input receives the full username; the template derives the first letter.
  // Kept as username (not initial) so the parent doesn't have to pre-process the string.
  @Input() username = '';

  get initial(): string {
    // charAt(0) is safe on an empty string — returns '' rather than throwing
    return this.username.charAt(0).toUpperCase();
  }
}
