import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast';

// This component is intentionally minimal — it's just a display layer.
// All the real logic (show, dismiss, auto-timeout) lives in ToastService so any
// component in the app can trigger toasts without needing to import this component.
@Component({
  selector: 'app-toast',
  standalone: true,
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
