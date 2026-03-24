import { Injectable } from '@angular/core';

// Three types felt right: success (green) for things that worked, error (red) for things that failed,
// info (blue) for neutral messages like "Search this user first" — avoids overloading the user with red when it's not really an error
export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// providedIn: 'root' makes this a singleton — every component shares the same toast array,
// so we never get two separate stacks fighting for screen space
@Injectable({ providedIn: 'root' })
export class ToastService {
  // Public so the ToastComponent can read it directly — no need for an Observable here since Angular's
  // default change detection picks up array mutations just fine
  toasts: Toast[] = [];

  // nextId acts as a simple counter so every toast has a unique ID — avoids accidental duplicate dismissals
  // if two toasts happen to have the same message content and are dismissed at the same time
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = ++this.nextId;
    this.toasts.push({ id, message, type });
    // 3500ms feels right — short enough not to block the UI, long enough for the user to read
    // a full sentence without rushing. The close button is always there if they want it gone sooner.
    setTimeout(() => this.dismiss(id), 3500);
  }

  dismiss(id: number) {
    // Filter instead of splice — avoids index shifting bugs when multiple toasts are dismissed rapidly
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
