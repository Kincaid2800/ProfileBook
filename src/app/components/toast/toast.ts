import { Component, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast';

// This component is intentionally minimal — it's just a display layer.
// All the real logic (show, dismiss, auto-timeout) lives in ToastService so any
// component in the app can trigger toasts without needing to import this component.

// ViewEncapsulation.None is used here deliberately:
// Toast is a truly global UI element — it sits in app.html outside <router-outlet>,
// uses `position: fixed` to anchor to the viewport, and must appear above every other
// component regardless of where it is in the DOM tree.
//
// With Emulated (the default), Angular would add a scoping attribute like
// [_ngcontent-abc-c5] to every CSS rule, which is unnecessary overhead for a component
// whose styles are global by design. None injects the styles once into the document <head>
// without attribute-scoping, which is exactly what a fixed-position overlay needs.
//
// Rule of thumb: use None only when the component IS the global layer (toasts, modals,
// overlays). Never use it for regular components — their styles would leak everywhere.
@Component({
  selector: 'app-toast',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  // CommonModule is needed for *ngFor and *ngIf in the template
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent {
  // Not private — the template reads toastService.toasts directly,
  // which is cleaner than creating a getter just to pass it through
  toastService = inject(ToastService);
}
