import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container text-center py-5">
      <h1 class="display-1 text-danger">404</h1>
      <h2 class="mb-4">Página no encontrada</h2>
      <p class="mb-4">La ruta que buscas no existe o ha sido movida.</p>
      <a routerLink="/dashboard" class="btn btn-primary btn-lg">
        <i class="bi bi-house me-2"></i>Ir al Dashboard
      </a>
    </div>
  `
})
export class NotFoundComponent {}
