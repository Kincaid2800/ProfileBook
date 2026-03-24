import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

/**
 * AutofocusDirective — Automatically focuses the host element after the view loads.
 *
 * Usage: Add appAutofocus to any input element to focus it on page load.
 * Example: <input appAutofocus type="text" />
 *
 * Why not use the native HTML `autofocus` attribute? It only works on initial page
 * load — it doesn't fire when Angular navigates to a new route because the browser
 * never does a full page reload in an SPA. This directive fills that gap.
 *
 * Why setTimeout(0)? Angular finishes rendering asynchronously, so we wait
 * one tick before calling focus() to ensure the element is ready in the DOM.
 * Without it, focus() fires before the input exists and silently does nothing.
 */
@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective implements AfterViewInit {
  // ElementRef gives us a reference to the actual DOM node this directive is attached to
  private el = inject(ElementRef);

  // AfterViewInit is the correct lifecycle hook here — by this point Angular has finished
  // inserting the element into the DOM, so focus() will actually land on the right input
  ngAfterViewInit() {
    // setTimeout(0) defers focus by one event loop tick, which is enough for Angular
    // to finish its asynchronous rendering and flush the DOM before we call focus()
    setTimeout(() => this.el.nativeElement.focus(), 0);
  }
}
