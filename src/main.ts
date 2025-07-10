import 'zone.js';
import { bootstrapApplication } from "@angular/platform-browser"
import { AppComponent } from "./app/app.component"
import { importProvidersFrom } from "@angular/core"
import { RouterModule } from "@angular/router"
import { routes } from "./app/app-routing.module"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { HttpClientModule } from "@angular/common/http"

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(RouterModule.forRoot(routes), FormsModule, ReactiveFormsModule, HttpClientModule)],
}).catch((err) => console.error(err))
