import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { actorInterceptor } from './api.service';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([actorInterceptor]))],
};

