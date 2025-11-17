import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ConfigService } from '../../services/config.service';

interface Jugador {
  _id: string;
  nombre: string;
  numero?: number;
  equipo: 'rojo' | 'azul';
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  posicion: {
    x: number;
    y: number;
  };
  activo?: boolean;
  fotoUrl?: string;
}

@Component({
  selector: 'app-top-tarjetas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="hero-section text-center py-4 bg-dark text-white">
        <div class="container">
          <h1 class="display-4 fw-bold mb-3">
            <i class="bi bi-exclamation-triangle-fill text-warning me-3"></i>
            Ranking de Tarjetas
          </h1>
          <p class="lead">Estadísticas disciplinarias del torneo</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="container py-3">
        <div class="row justify-content-center mb-4">
          <div class="col-md-6">
            <div class="btn-group w-100" role="group">
              <button type="button" 
                      class="btn btn-lg"
                      [class.btn-warning]="tipoTarjeta === 'amarillas'"
                      [class.btn-outline-warning]="tipoTarjeta !== 'amarillas'"
                      (click)="cambiarFiltro('amarillas')">
                <i class="bi bi-square-fill me-2"></i>
                Tarjetas Amarillas
              </button>
              <button type="button" 
                      class="btn btn-lg"
                      [class.btn-danger]="tipoTarjeta === 'rojas'"
                      [class.btn-outline-danger]="tipoTarjeta !== 'rojas'"
                      (click)="cambiarFiltro('rojas')">
                <i class="bi bi-square-fill me-2"></i>
                Tarjetas Rojas
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="container py-4">
        <!-- Estadísticas generales -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="stat-card bg-primary text-white rounded p-3 text-center">
              <i class="bi bi-people-fill fs-2"></i>
              <h3>{{ jugadoresFiltrados.length }}</h3>
              <p class="mb-0">Jugadores con Tarjetas</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card bg-warning text-dark rounded p-3 text-center">
              <i class="bi bi-square-fill fs-2"></i>
              <h3>{{ totalAmarillas }}</h3>
              <p class="mb-0">Tarjetas Amarillas</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card bg-danger text-white rounded p-3 text-center">
              <i class="bi bi-square-fill fs-2"></i>
              <h3>{{ totalRojas }}</h3>
              <p class="mb-0">Tarjetas Rojas</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card bg-dark text-white rounded p-3 text-center">
              <i class="bi bi-graph-up fs-2"></i>
              <h3>{{ totalTarjetas }}</h3>
              <p class="mb-0">Total Tarjetas</p>
            </div>
          </div>
        </div>

        <!-- Tabla de jugadores con tarjetas -->
        <div class="card shadow">
          <div class="card-header text-white"
               [class.bg-warning]="tipoTarjeta === 'amarillas'"
               [class.bg-danger]="tipoTarjeta === 'rojas'">
            <h5 class="mb-0" [class.text-dark]="tipoTarjeta === 'amarillas'">
              <i class="bi bi-list-ol me-2"></i>
              Ranking de Tarjetas {{ tipoTarjeta === 'amarillas' ? 'Amarillas' : 'Rojas' }}
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-dark">
                  <tr>
                    <th scope="col" class="text-center">#</th>
                    <th scope="col">Jugador</th>
                    <th scope="col" class="text-center">Número</th>
                    <th scope="col" class="text-center">Equipo</th>
                    <th scope="col" class="text-center">Amarillas</th>
                    <th scope="col" class="text-center">Rojas</th>
                    <th scope="col" class="text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let jugador of jugadoresFiltrados; let i = index" 
                      [class.table-warning]="i === 0 && tipoTarjeta === 'amarillas'"
                      [class.table-danger]="i === 0 && tipoTarjeta === 'rojas'"
                      [class.table-light]="i === 1"
                      [class.table-secondary]="i === 2">
                    <td class="text-center fw-bold">
                      <span *ngIf="i === 0" class="badge"
                            [class.bg-warning]="tipoTarjeta === 'amarillas'"
                            [class.bg-danger]="tipoTarjeta === 'rojas'"
                            [class.text-dark]="tipoTarjeta === 'amarillas'">
                        🥇
                      </span>
                      <span *ngIf="i === 1" class="badge bg-secondary">🥈</span>
                      <span *ngIf="i === 2" class="badge bg-warning text-dark">🥉</span>
                      <span *ngIf="i > 2">{{ i + 1 }}</span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="jugador-avatar me-3" 
                             [class.equipo-rojo]="jugador.equipo === 'rojo'"
                             [class.equipo-azul]="jugador.equipo === 'azul'">
                          <img *ngIf="jugador.fotoUrl" [src]="jugador.fotoUrl" alt="Foto" class="jugador-foto-small" />
                          <i *ngIf="!jugador.fotoUrl" class="bi bi-person-fill"></i>
                        </div>
                        <div>
                          <strong>{{ jugador.nombre }}</strong>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-dark">{{ jugador.numero || 'N/A' }}</span>
                    </td>
                    <td class="text-center">
                      <span class="badge" 
                            [class.bg-danger]="jugador.equipo === 'rojo'"
                            [class.bg-primary]="jugador.equipo === 'azul'">
                        {{ jugador.equipo === 'rojo' ? 'Rojo' : 'Azul' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-warning text-dark fs-6" *ngIf="jugador.tarjetasAmarillas > 0">
                        <i class="bi bi-square-fill me-1"></i>{{ jugador.tarjetasAmarillas }}
                      </span>
                      <span *ngIf="jugador.tarjetasAmarillas === 0" class="text-muted">-</span>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-danger fs-6" *ngIf="jugador.tarjetasRojas > 0">
                        <i class="bi bi-square-fill me-1"></i>{{ jugador.tarjetasRojas }}
                      </span>
                      <span *ngIf="jugador.tarjetasRojas === 0" class="text-muted">-</span>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-dark">{{ jugador.tarjetasAmarillas + jugador.tarjetasRojas }}</span>
                    </td>
                  </tr>
                  <tr *ngIf="jugadoresFiltrados.length === 0">
                    <td colspan="7" class="text-center text-muted py-4">
                      <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                      No hay jugadores con tarjetas {{ tipoTarjeta }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="text-center mt-4">
          <button class="btn btn-warning btn-lg me-3" (click)="cargarJugadores()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Actualizar Ranking
          </button>
          <a routerLink="/" class="btn btn-outline-secondary btn-lg">
            <i class="bi bi-house me-2"></i>
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    }
    
    .stat-card {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
    }
    
    .jugador-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }
    
    .equipo-rojo {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    }
    
    .equipo-azul {
      background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
    }
    
    .jugador-foto-small {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    
    .btn-group .btn {
      border: 2px solid;
    }
  `]
})
export class TopTarjetasComponent implements OnInit {
  jugadores: Jugador[] = [];
  tipoTarjeta: 'amarillas' | 'rojas' = 'amarillas';
  loading = false;

  constructor(private http: HttpClient, private configService: ConfigService) {}

  ngOnInit(): void {
    this.cargarJugadores();
  }

  get jugadoresFiltrados(): Jugador[] {
    return this.jugadores
      .filter(j => {
        if (this.tipoTarjeta === 'amarillas') {
          return j.tarjetasAmarillas > 0;
        } else {
          return j.tarjetasRojas > 0;
        }
      })
      .sort((a, b) => {
        if (this.tipoTarjeta === 'amarillas') {
          if (b.tarjetasAmarillas !== a.tarjetasAmarillas) {
            return b.tarjetasAmarillas - a.tarjetasAmarillas;
          }
        } else {
          if (b.tarjetasRojas !== a.tarjetasRojas) {
            return b.tarjetasRojas - a.tarjetasRojas;
          }
        }
        return a.nombre.localeCompare(b.nombre);
      });
  }

  get totalAmarillas(): number {
    return this.jugadores.reduce((total, j) => total + (j.tarjetasAmarillas || 0), 0);
  }

  get totalRojas(): number {
    return this.jugadores.reduce((total, j) => total + (j.tarjetasRojas || 0), 0);
  }

  get totalTarjetas(): number {
    return this.totalAmarillas + this.totalRojas;
  }

  cargarJugadores(): void {
    this.loading = true;
    this.http.get<any>(this.configService.getFullApiUrl('/jugadores'))
      .subscribe({
        next: (response) => {
          this.jugadores = response.data.filter((jugador: Jugador) => jugador.activo !== false);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando jugadores:', error);
          this.loading = false;
        }
      });
  }

  cambiarFiltro(tipo: 'amarillas' | 'rojas'): void {
    this.tipoTarjeta = tipo;
  }
}
