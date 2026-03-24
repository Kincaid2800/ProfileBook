import { Directive, ElementRef, HostListener, inject } from '@angular/core';

/**
 * TrimInputDirective — Trims leading and trailing whitespace from an input on blur.
 *
 * Usage: Add appTrimInput to any text input to auto-clean the value when the user
 * leaves the field. Works with [(ngModel)] by dispatching an 'input' event after
 * trimming so Angular picks up the updated value.
 *
 * Example: <input appTrimInput type="text" [(ngModel)]="email" />
 *
 * Why blur and not keyup? Trimming on every keystroke would feel broken — the user
 * couldn't type a space anywhere in the middle of a sentence. Blur fires when the
 * user is done with the field, which is the right moment to clean it up.
 *
 * Why dispatch 'input'? Directly changing el.value bypasses Angular's change
 * detection. Dispatching the native input event triggers ngModel to sync.
 * Without this, the input looks trimmed on screen but the bound component property
 * still holds the original untrimmed string — so validation would still fail.
 */
@Directive({
  selector: '[appTrimInput]',
  standalone: true
})
export class TrimInputDirective {
  private el = inject(ElementRef);

  // @HostListener attaches the blur handler to the element this directive is applied to —
  // no need to manually add/remove event listeners in ngOnInit/ngOnDestroy
  @HostListener('blur')
  onBlur() {
    const input = this.el.nativeElement as HTMLInputElement;
    const trimmed = input.value.trim();

    // We only update and dispatch the event if the value actually changed —
    // avoids unnecessary ngModel cycles when the user typed something already clean
    if (input.value !== trimmed) {
      input.value = trimmed;
      // Dispatching a native 'input' event is the only reliable way to tell ngModel
      // that the value changed from outside Angular — 'change' events don't always work
      input.dispatchEvent(new Event('input'));
    }
  }
}
