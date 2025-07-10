import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';

interface Jugador {
  _id: string;
  nombre: string;
  numero?: number;
  equipo: 'rojo' | 'azul';
  goles: number;
  asistencias: number;
  posicion: {
    x: number;
    y: number;
  };
  activo?: boolean;
  fotoUrl?: string; // Added fotoUrl to the interface
}

@Component({
  selector: 'app-top-goleadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="hero-section text-center py-4 bg-dark text-white">
        <div class="container">
          <h1 class="display-4 fw-bold mb-3">
            <i class="bi bi-trophy-fill text-warning me-3"></i>
            Top Goleadores
          </h1>
          <p class="lead">Ranking de los mejores goleadores del torneo</p>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="container py-4">
        <!-- Estadísticas generales -->
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="stat-card bg-primary text-white rounded p-3 text-center">
              <i class="bi bi-people-fill fs-2"></i>
              <h3>{{ goleadores.length }}</h3>
              <p class="mb-0">Total Jugadores</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card bg-success text-white rounded p-3 text-center">
              <i class="bi bi-dribbble fs-2"></i>
              <h3>{{ totalGoles }}</h3>
              <p class="mb-0">Total Goles</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card bg-info text-white rounded p-3 text-center">
              <i class="bi bi-graph-up fs-2"></i>
              <h3>{{ promedioGoles.toFixed(1) }}</h3>
              <p class="mb-0">Promedio por Jugador</p>
            </div>
          </div>
        </div>

        <!-- Tabla de goleadores -->
        <div class="card shadow">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0">
              <i class="bi bi-list-ol me-2"></i>
              Ranking de Goleadores
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
                    <th scope="col" class="text-center">Goles</th>
                    <th scope="col" class="text-center">Asistencias</th>
                    <th scope="col" class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let jugador of goleadores; let i = index" 
                      [class.table-warning]="i === 0"
                      [class.table-light]="i === 1"
                      [class.table-secondary]="i === 2">
                    <td class="text-center fw-bold">
                      <span *ngIf="i === 0" class="badge bg-warning text-dark">🥇</span>
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
                      <span class="badge bg-success fs-6">{{ jugador.goles }}</span>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-info">{{ jugador.asistencias }}</span>
                    </td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-success me-1" 
                              (click)="agregarGol(jugador)">
                        <i class="bi bi-plus-circle"></i> Gol
                      </button>
                      <button class="btn btn-sm btn-outline-info" 
                              (click)="agregarAsistencia(jugador)">
                        <i class="bi bi-arrow-up-circle"></i> Asistencia
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
          <button class="btn btn-primary btn-lg me-3" (click)="cargarGoleadores()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Actualizar Ranking
          </button>
          <a routerLink="/" class="btn btn-outline-secondary btn-lg">
            <i class="bi bi-house me-2"></i>
            Volver al Campo
          </a>
        </div>
      </div>
    </div>

    <!-- Modal para agregar gol -->
    <div class="modal fade" id="agregarGolModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Gol</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>¿Agregar 1 gol a <strong>{{ jugadorSeleccionado?.nombre }}</strong>?</p>
            <p class="text-muted">Goles actuales: {{ jugadorSeleccionado?.goles }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-success" (click)="confirmarAgregarGol()">
              <i class="bi bi-check-lg me-1"></i>
              Confirmar
            </button>
          </div>
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
  styleUrls: ['./top-goleadores.component.scss']
})
export class TopGoleadoresComponent implements OnInit {
  goleadores: Jugador[] = [];
  jugadorSeleccionado: Jugador | null = null;
  loading = false;

  constructor(private http: HttpClient, private configService: ConfigService) {}

  ngOnInit(): void {
    this.cargarGoleadores();
  }

  cargarGoleadores(): void {
    this.loading = true;
    this.http.get<any>(this.configService.getFullApiUrl('/jugadores'))
      .subscribe({
        next: (response) => {
          this.goleadores = response.data
            .filter((jugador: Jugador) => jugador.activo !== false)
            .sort((a: Jugador, b: Jugador) => {
              // Primero por goles (descendente)
              if (b.goles !== a.goles) {
                return b.goles - a.goles;
              }
              // Si tienen los mismos goles, por asistencias (descendente)
              if (b.asistencias !== a.asistencias) {
                return b.asistencias - a.asistencias;
              }
              // Si tienen las mismas asistencias, por nombre
              return a.nombre.localeCompare(b.nombre);
            });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando goleadores:', error);
          this.loading = false;
        }
      });
  }

  agregarGol(jugador: Jugador): void {
    this.jugadorSeleccionado = jugador;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('agregarGolModal'));
    modal.show();
  }

  agregarAsistencia(jugador: Jugador): void {
    this.jugadorSeleccionado = jugador;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('agregarAsistenciaModal'));
    modal.show();
  }

  confirmarAgregarGol(): void {
    if (!this.jugadorSeleccionado) return;

    this.http.put<any>(`${this.configService.getApiUrl()}/api/jugadores/${this.jugadorSeleccionado._id}/goles`, {
      cantidad: 1
    }).subscribe({
      next: (response) => {
        console.log('Gol agregado exitosamente');
        this.cargarGoleadores();
        const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('agregarGolModal'));
        modal.hide();
      },
      error: (error) => {
        console.error('Error agregando gol:', error);
        alert('Error al agregar gol');
      }
    });
  }

  confirmarAgregarAsistencia(): void {
    if (!this.jugadorSeleccionado) return;

    this.http.put<any>(`${this.configService.getApiUrl()}/api/jugadores/${this.jugadorSeleccionado._id}/asistencias`, {
      cantidad: 1
    }).subscribe({
      next: (response) => {
        console.log('Asistencia agregada exitosamente');
        this.cargarGoleadores();
        const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('agregarAsistenciaModal'));
        modal.hide();
      },
      error: (error) => {
        console.error('Error agregando asistencia:', error);
        alert('Error al agregar asistencia');
      }
    });
  }

  get totalGoles(): number {
    return this.goleadores.reduce((total, jugador) => total + jugador.goles, 0);
  }

  get promedioGoles(): number {
    return this.goleadores.length > 0 ? this.totalGoles / this.goleadores.length : 0;
  }

  // Función robusta para obtener la URL de la foto del jugador (igual que en gestión jugadores)
  getFotoUrl(jugador: Jugador | any): string {
    if (!jugador) return 'assets/img/avatar-default.png';
    if (jugador.fotoUrl && typeof jugador.fotoUrl === 'string' && jugador.fotoUrl.startsWith('http')) {
      return jugador.fotoUrl;
    }
    return 'assets/img/avatar-default.png';
  }
}