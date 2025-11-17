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
  selector: 'app-top-asistencias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="hero-section text-center py-4 bg-dark text-white">
        <div class="container">
          <h1 class="display-4 fw-bold mb-3">
            <i class="bi bi-award-fill text-info me-3"></i>
            Top Asistencias
          </h1>
          <p class="lead">Ranking de los mejores asistidores del torneo</p>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="container py-4">
        <!-- Estadísticas generales -->
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="stat-card bg-primary text-white rounded p-3 text-center">
              <i class="bi bi-people-fill fs-2"></i>
              <h3>{{ asistidores.length }}</h3>
              <p class="mb-0">Total Jugadores</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card bg-info text-white rounded p-3 text-center">
              <i class="bi bi-bootstrap-reboot fs-2"></i>
              <h3>{{ totalAsistencias }}</h3>
              <p class="mb-0">Total Asistencias</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card bg-success text-white rounded p-3 text-center">
              <i class="bi bi-graph-up fs-2"></i>
              <h3>{{ promedioAsistencias.toFixed(1) }}</h3>
              <p class="mb-0">Promedio por Jugador</p>
            </div>
          </div>
        </div>

        <!-- Tabla de asistidores -->
        <div class="card shadow">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0">
              <i class="bi bi-list-ol me-2"></i>
              Ranking de Asistidores
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
                    <th scope="col" class="text-center">Asistencias</th>
                    <th scope="col" class="text-center">Goles</th>
                    <th scope="col" class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let jugador of asistidores; let i = index" 
                      [class.table-info]="i === 0"
                      [class.table-light]="i === 1"
                      [class.table-secondary]="i === 2">
                    <td class="text-center fw-bold">
                      <span *ngIf="i === 0" class="badge bg-info text-dark">🥇</span>
                      <span *ngIf="i === 1" class="badge bg-secondary">🥈</span>
                      <span *ngIf="i === 2" class="badge bg-warning">🥉</span>
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
                      <span class="badge bg-info fs-6">
                        <i class="bi bi-bootstrap-reboot me-1"></i>{{ jugador.asistencias }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-success">{{ jugador.goles }}</span>
                    </td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-info" 
                              (click)="agregarAsistencia(jugador)">
                        <i class="bi bi-plus-circle"></i> Asistencia
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="text-center mt-4">
          <button class="btn btn-info btn-lg me-3" (click)="cargarAsistidores()">
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

    <!-- Modal para agregar asistencia -->
    <div class="modal fade" id="agregarAsistenciaModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Asistencia</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>¿Agregar 1 asistencia a <strong>{{ jugadorSeleccionado?.nombre }}</strong>?</p>
            <p class="text-muted">Asistencias actuales: {{ jugadorSeleccionado?.asistencias }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-info" (click)="confirmarAgregarAsistencia()">
              <i class="bi bi-check-lg me-1"></i>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
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
    
    .table-hover tbody tr:hover {
      background-color: rgba(13, 202, 240, 0.1);
    }
  `]
})
export class TopAsistenciasComponent implements OnInit {
  asistidores: Jugador[] = [];
  jugadorSeleccionado: Jugador | null = null;
  loading = false;

  constructor(private http: HttpClient, private configService: ConfigService) {}

  ngOnInit(): void {
    this.cargarAsistidores();
  }

  get totalAsistencias(): number {
    return this.asistidores.reduce((total, j) => total + j.asistencias, 0);
  }

  get promedioAsistencias(): number {
    return this.asistidores.length > 0 ? this.totalAsistencias / this.asistidores.length : 0;
  }

  cargarAsistidores(): void {
    this.loading = true;
    this.http.get<any>(this.configService.getFullApiUrl('/jugadores'))
      .subscribe({
        next: (response) => {
          this.asistidores = response.data
            .filter((jugador: Jugador) => jugador.activo !== false)
            .sort((a: Jugador, b: Jugador) => {
              // Primero por asistencias (descendente)
              if (b.asistencias !== a.asistencias) {
                return b.asistencias - a.asistencias;
              }
              // Si tienen las mismas asistencias, por goles (descendente)
              if (b.goles !== a.goles) {
                return b.goles - a.goles;
              }
              // Si tienen los mismos goles, por nombre
              return a.nombre.localeCompare(b.nombre);
            });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando asistidores:', error);
          this.loading = false;
        }
      });
  }

  agregarAsistencia(jugador: Jugador): void {
    this.jugadorSeleccionado = jugador;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('agregarAsistenciaModal'));
    modal.show();
  }

  confirmarAgregarAsistencia(): void {
    if (this.jugadorSeleccionado) {
      const url = this.configService.getFullApiUrl(`/jugadores/${this.jugadorSeleccionado._id}/asistencia`);
      
      this.http.put(url, {}).subscribe({
        next: () => {
          if (this.jugadorSeleccionado) {
            this.jugadorSeleccionado.asistencias++;
          }
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('agregarAsistenciaModal'));
          modal.hide();
          this.cargarAsistidores();
        },
        error: (error) => {
          console.error('Error agregando asistencia:', error);
          alert('Error al agregar asistencia');
        }
      });
    }
  }
}
