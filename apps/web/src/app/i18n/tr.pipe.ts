import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';

@Pipe({ standalone: true, name: 'tr', pure: false })
export class TrPipe implements PipeTransform {
  private readonly i18n: I18nService;

  constructor(i18n: I18nService) {
    this.i18n = i18n;
  }

  transform(key: string): string {
    return this.i18n.t(key);
  }
}
