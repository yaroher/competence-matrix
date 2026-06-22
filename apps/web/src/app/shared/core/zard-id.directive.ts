import { Directive, computed, input } from '@angular/core';

let nextId = 0;

@Directive({
  selector: '[zardId]',
  standalone: true,
  exportAs: 'zardId',
})
export class ZardIdDirective {
  private readonly suffix = ++nextId;
  readonly zardId = input('zard', { alias: 'zardId' });
  readonly id = computed(() => `${this.zardId()}-${this.suffix}`);
}
