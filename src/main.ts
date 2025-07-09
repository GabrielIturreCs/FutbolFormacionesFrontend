import 'zone.js';
import { bootstrapApplication } from "@angular/platform-browser"
import { AppComponent } from "./app/app.component"
import { importProvidersFrom } from "@angular/core"
import { RouterModule } from "@angular/router"
import { routes } from "./app/app-routing.module"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(RouterModule.forRoot(routes), FormsModule, ReactiveFormsModule)],
}).catch((err) => console.error(err))
