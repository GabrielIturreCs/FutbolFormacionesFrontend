import { Component } from "@angular/core"
import { RouterModule } from "@angular/router"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-custom">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" routerLink="/">
          <i class="bi bi-trophy-fill text-warning me-2 fs-4"></i>
          <span class="fw-bold">Fútbol Manager</span>
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <i class="bi bi-house-fill me-1"></i>
                Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/gestion-jugadores" routerLinkActive="active">
                <i class="bi bi-people-fill me-1"></i>
                Jugadores
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/formaciones" routerLinkActive="active">
                <i class="bi bi-diagram-3-fill me-1"></i>
                Formaciones
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/top-goleadores" routerLinkActive="active">
                <i class="bi bi-trophy-fill me-1"></i>
                Top Goleadores
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
    .navbar-brand {
      font-size: 1.5rem;
      transition: all 0.3s ease;
    }
    
    .navbar-brand:hover {
      transform: scale(1.05);
    }
    
    .nav-link {
      transition: all 0.3s ease;
      border-radius: 20px;
      margin: 0 5px;
      padding: 8px 15px !important;
    }
    
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
    
    .nav-link.active {
      background-color: var(--bs-primary);
      color: white !important;
    }
  `,
  ],
})
export class HeaderComponent {}
