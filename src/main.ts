import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { APP_CONFIG } from './environments/environment';
//import * as Sentry from '@sentry/angular-ivy';

if (APP_CONFIG.production) {
  enableProdMode();
}

// Sentry.init({
//   dsn: 'https://509b3c87f71cb4b0768d9948d8a20c80@o4506058554605568.ingest.sentry.io/4506058655072256',
//   integrations: [
//     new Sentry.BrowserTracing({
//       tracePropagationTargets: ['localhost'],
//       routingInstrumentation: Sentry.routingInstrumentation,
//     }),
//     new Sentry.Replay(),
//   ],
//   tracesSampleRate: 1.0,
//   replaysSessionSampleRate: 0.1,
//   replaysOnErrorSampleRate: 1.0,
// });
enableProdMode();
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then((success) => console.log('Bootstrap success'))
  .catch((err) => console.error(err));

// platformBrowserDynamic()
//   .bootstrapModule(AppModule, {
//     preserveWhitespaces: false
//   })
//   .catch(err => console.error(err));
