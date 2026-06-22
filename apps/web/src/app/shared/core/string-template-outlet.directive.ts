import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

@Directive({
  selector: '[zStringTemplateOutlet]',
  standalone: true,
})
export class ZardStringTemplateOutletDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainerRef = inject(ViewContainerRef);

  readonly zStringTemplateOutlet = input<string | TemplateRef<void> | undefined>(undefined, {
    alias: 'zStringTemplateOutlet',
  });

  constructor() {
    effect(() => {
      const value = this.zStringTemplateOutlet();
      this.viewContainerRef.clear();

      if (value instanceof TemplateRef) {
        this.viewContainerRef.createEmbeddedView(value);
        return;
      }

      this.viewContainerRef.createEmbeddedView(this.templateRef);
    });
  }
}
