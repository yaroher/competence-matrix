import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'cmx-toasts',
  standalone: true,
  template: `
    <div class="toast-host" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class.toast-err]="t.kind === 'error'" [class.toast-ok]="t.kind === 'success'" (click)="toast.dismiss(t.id)">
          <span class="toast-dot"></span>
          <span>{{ t.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-host {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 10000;
        display: grid;
        gap: 10px;
        max-width: min(380px, 92vw);
      }
      .toast {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 11px;
        background: #fff;
        color: #14181f;
        font-size: 13px;
        line-height: 1.4;
        box-shadow: 0 14px 34px -10px rgba(20, 24, 31, 0.22), 0 4px 10px -4px rgba(20, 24, 31, 0.12);
        border: 1px solid rgba(228, 231, 236, 0.9);
        cursor: pointer;
        animation: toast-in 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .toast-ok {
        border-color: rgba(31, 122, 77, 0.3);
      }
      .toast-err {
        border-color: rgba(168, 42, 31, 0.3);
      }
      .toast-dot {
        flex: none;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-top: 6px;
        background: #626b7a;
      }
      .toast-ok .toast-dot {
        background: #1f7a4d;
      }
      .toast-err .toast-dot {
        background: #a82a1f;
      }
      @keyframes toast-in {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }
    `,
  ],
})
export class ToastsComponent {
  readonly toast = inject(ToastService);
}
