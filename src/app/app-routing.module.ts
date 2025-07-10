import type { Routes } from "@angular/router"

export const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full"
  },
  {
    path: "dashboard",
    loadComponent: () => import("./components/dashboard/dashboard.component").then((m) => m.DashboardComponent),
  },
  {
    path: "equipo-form",
    loadComponent: () => import("./components/equipo-form/equipo-form.component").then((m) => m.EquipoFormComponent),
  },
  {
    path: "top-goleadores",
    loadComponent: () => import("./components/top-goleadores/top-goleadores.component").then((m) => m.TopGoleadoresComponent),
  },
  {
    path: "gestion-jugadores",
    loadComponent: () => import("./components/gestion-jugadores/gestion-jugadores.component").then((m) => m.GestionJugadoresComponent),
  },
  {
    path: "formaciones",
    loadComponent: () => import("./components/formaciones/formaciones.component").then((m) => m.FormacionesComponent),
  },
  {
    path: "crear-formacion",
    loadComponent: () => import("./components/crear-formacion/crear-formacion.component").then((m) => m.CrearFormacionComponent),
  },
  {
    path: "editar-formacion/:id",
    loadComponent: () => import("./components/crear-formacion/crear-formacion.component").then((m) => m.CrearFormacionComponent),
  },
  {
    path: "formacion/:id",
    loadComponent: () => import("./components/ver-formacion/ver-formacion.component").then((m) => m.VerFormacionComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
]
