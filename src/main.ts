import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

(window as any).MonacoEnvironment = {
  getWorkerUrl: function (moduleId: any, label: string) {
    return './assets/monaco/vs/base/worker/workerMain.js';
  }
};

platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
