import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// ToastComponent is imported here at the root level so it renders outside the router-outlet —
// this means toasts survive page navigation and don't get destroyed mid-display
import { ToastComponent } from './components/toast/toast';

// AppComponent is intentionally thin — it's just a shell for the router and the global toast stack.
// All real UI logic lives in the routed feature components.
@Component({
  selector: 'app-root',
  standalone: true,
  // RouterOutlet swaps in the correct component based on the URL.
  // ToastComponent sits alongside it so toasts are always rendered at the top of the DOM tree.
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  // Required by Angular's bootstrapping — not used anywhere in this app directly
  title = 'profilebook';
}