import { Injectable } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: Toast[] = [];
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = ++this.nextId;
    this.toasts.push({ id, message, type });
    setTimeout(() => this.dismiss(id), 3500);
  }

  dismiss(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
