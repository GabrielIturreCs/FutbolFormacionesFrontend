import type { Routes } from "@angular/router"

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./components/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "equipo-form",
    loadComponent: () => import("./components/equipo-form/equipo-form.component").then((m) => m.EquipoFormComponent),
  },
  {
    path: "**",
    redirectTo: "",
  },
]
