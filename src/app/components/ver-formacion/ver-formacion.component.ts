import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ConfigService } from '../../services/config.service';

interface Jugador {
  _id: string;
  nombre: string;
  numero?: number;
  equipo: string;
  goles: number;
  asistencias: number;
  fotoUrl?: string;
}

interface JugadorFormacion {
  jugadorId: Jugador;
  posicion: {
    x: number;
    y: number;
  };
  numero?: number;
}

interface Equipo {
  nombre: string;
  color: string;
  jugadores: JugadorFormacion[];
}

interface Formacion {
  _id: string;
  nombre: string;
  descripcion?: string;
  fecha: string;
  equipos: {
    local: Equipo;
    visitante: Equipo;
  };
  activa: boolean;
  creadaPor: string;
}

@Component({
  selector: 'app-ver-formacion',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="h2 mb-1">
                <i class="bi bi-diagram-3-fill text-primary me-2"></i>
                {{ formacion?.nombre || 'Formación' }}
              </h1>
              <p class="text-muted mb-0">
                <i class="bi bi-calendar me-1"></i>
                {{ formacion?.fecha | date:'dd/MM/yyyy HH:mm' }}
              </p>
            </div>
            <div class="btn-group">
              <span class="btn btn-outline-primary btn-custom disabled" style="pointer-events:none;opacity:1;">
                <i class="bi bi-eye me-1"></i>
                Ver Formación
              </span>
              <a class="btn btn-outline-secondary btn-custom" routerLink="/formaciones">
                <i class="bi bi-arrow-left me-1"></i>
                Volver
              </a>
            </div>
          </div>

          <!-- Agregar botón Editar dentro de la vista, arriba del campo de fútbol -->
          <div class="row mb-3">
            <div class="col-12 text-end">
              <button class="btn btn-outline-primary btn-lg btn-custom" (click)="editarFormacion()">
                <i class="bi bi-pencil me-1"></i>
                Editar
              </button>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="row mb-4">
            <div class="col-md-3">
              <div class="stat-card bg-primary text-white">
                <div class="card-body text-center">
                  <i class="bi bi-people-fill fs-1 mb-2"></i>
                  <h4>{{ getTotalJugadores() }}</h4>
                  <p class="mb-0">Total Jugadores</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card bg-success text-white">
                <div class="card-body text-center">
                  <i class="bi bi-dribbble fs-1 mb-2"></i>
                  <h4>{{ getTotalGoles() }}</h4>
                  <p class="mb-0">Total Goles</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card bg-info text-white">
                <div class="card-body text-center">
                  <i class="bi bi-arrow-up-circle fs-1 mb-2"></i>
                  <h4>{{ getTotalAsistencias() }}</h4>
                  <p class="mb-0">Total Asistencias</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card bg-warning text-dark">
                <div class="card-body text-center">
                  <i class="bi bi-trophy fs-1 mb-2"></i>
                  <h4>{{ getMejorGoleador()?.nombre || 'N/A' }}</h4>
                  <p class="mb-0">Mejor Goleador</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Campo de Fútbol -->
          <div class="row">
            <div class="col-12">
              <div class="card campo-card">
                <div class="card-header">
                  <h5 class="mb-0">
                    <i class="bi bi-pitch me-2"></i>
                    Vista del Campo
                  </h5>
                </div>
                <div class="card-body p-0">
                  <div class="football-field">
                    <!-- Líneas del campo -->
                    <div class="field-lines">
                      <div class="center-circle"></div>
                      <div class="center-line"></div>
                      <div class="penalty-area-left"></div>
                      <div class="penalty-area-right"></div>
                      <div class="goal-area-left"></div>
                      <div class="goal-area-right"></div>
                    </div>

                    <!-- Equipo Local (Izquierda) -->
                    <div class="team local-team">
                      <div class="team-info">
                        <div class="team-color" [style.background-color]="formacion?.equipos?.local?.color || '#007bff'"></div>
                        <span class="team-name">{{ formacion?.equipos?.local?.nombre || 'Equipo Local' }}</span>
                      </div>
                      <div class="players-container">
                        <div *ngFor="let jugador of formacion?.equipos?.local?.jugadores || []"
                             class="player local-player"
                             [style.left]="jugador.posicion.x + '%'"
                             [style.top]="jugador.posicion.y + '%'"
                             [title]="jugador.jugadorId.nombre + ' - ' + jugador.jugadorId.goles + ' goles'">
                          <div class="player-number">{{ jugador.numero || jugador.jugadorId.numero || '?' }}</div>
                          <div class="player-avatar">
                            <ng-container *ngIf="getFotoUrl(jugador.jugadorId) !== 'assets/img/avatar-default.png'; else icono">
                              <img [src]="getFotoUrl(jugador.jugadorId)" class="jugador-foto-campo" alt="Foto" />
                            </ng-container>
                            <ng-template #icono>
                              <i class="bi bi-person-circle jugador-foto-campo"></i>
                            </ng-template>
                          </div>
                          <div class="player-name">{{ jugador.jugadorId.nombre }}</div>
                          <div class="player-stats">
                            <small>{{ jugador.jugadorId.goles }}⚽ {{ jugador.jugadorId.asistencias }}🎯</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Equipo Visitante (Derecha) -->
                    <div class="team visitor-team">
                      <div class="team-info">
                        <div class="team-color" [style.background-color]="formacion?.equipos?.visitante?.color || '#dc3545'"></div>
                        <span class="team-name">{{ formacion?.equipos?.visitante?.nombre || 'Equipo Visitante' }}</span>
                      </div>
                      <div class="players-container">
                        <div *ngFor="let jugador of formacion?.equipos?.visitante?.jugadores || []"
                             class="player visitor-player"
                             [style.left]="jugador.posicion.x + '%'"
                             [style.top]="jugador.posicion.y + '%'"
                             [title]="jugador.jugadorId.nombre + ' - ' + jugador.jugadorId.goles + ' goles'">
                          <div class="player-number">{{ jugador.numero || jugador.jugadorId.numero || '?' }}</div>
                          <div class="player-avatar">
                            <ng-container *ngIf="getFotoUrl(jugador.jugadorId) !== 'assets/img/avatar-default.png'; else icono">
                              <img [src]="getFotoUrl(jugador.jugadorId)" class="jugador-foto-campo" alt="Foto" />
                            </ng-container>
                            <ng-template #icono>
                              <i class="bi bi-person-circle jugador-foto-campo"></i>
                            </ng-template>
                          </div>
                          <div class="player-name">{{ jugador.jugadorId.nombre }}</div>
                          <div class="player-stats">
                            <small>{{ jugador.jugadorId.goles }}⚽ {{ jugador.jugadorId.asistencias }}🎯</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista de Jugadores -->
          <div class="row mt-4">
            <div class="col-md-6">
              <div class="card jugadores-card">
                <div class="card-header">
                  <h6 class="mb-0">
                    <i class="bi bi-people me-2"></i>
                    {{ formacion?.equipos?.local?.nombre || 'Equipo Local' }}
                  </h6>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Nombre</th>
                          <th>Goles</th>
                          <th>Asistencias</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let jugador of formacion?.equipos?.local?.jugadores || []">
                          <td>{{ jugador.numero || jugador.jugadorId.numero || '-' }}</td>
                          <td>{{ jugador.jugadorId.nombre }}</td>
                          <td>{{ jugador.jugadorId.goles }}</td>
                          <td>{{ jugador.jugadorId.asistencias }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card jugadores-card">
                <div class="card-header">
                  <h6 class="mb-0">
                    <i class="bi bi-people me-2"></i>
                    {{ formacion?.equipos?.visitante?.nombre || 'Equipo Visitante' }}
                  </h6>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Nombre</th>
                          <th>Goles</th>
                          <th>Asistencias</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let jugador of formacion?.equipos?.visitante?.jugadores || []">
                          <td>{{ jugador.numero || jugador.jugadorId.numero || '-' }}</td>
                          <td>{{ jugador.jugadorId.nombre }}</td>
                          <td>{{ jugador.jugadorId.goles }}</td>
                          <td>{{ jugador.jugadorId.asistencias }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ver-formacion.component.scss']
})
export class VerFormacionComponent implements OnInit {
  formacion: Formacion | null = null;
  formacionId: string = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.formacionId = this.route.snapshot.params['id'];
    this.cargarFormacion();
  }

  cargarFormacion(): void {
    this.http.get<any>(`${this.configService.getApiUrl()}/api/formaciones/${this.formacionId}`)
      .subscribe({
        next: (response) => {
          this.formacion = response.data;
        },
        error: (error) => {
          console.error('Error cargando formación:', error);
        }
      });
  }

  getTotalJugadores(): number {
    if (!this.formacion) return 0;
    return (this.formacion.equipos?.local?.jugadores?.length || 0) +
           (this.formacion.equipos?.visitante?.jugadores?.length || 0);
  }

  getTotalGoles(): number {
    if (!this.formacion) return 0;
    const golesLocal = (this.formacion.equipos?.local?.jugadores || []).reduce((total, jugador) => 
      total + (jugador.jugadorId.goles || 0), 0);
    const golesVisitante = (this.formacion.equipos?.visitante?.jugadores || []).reduce((total, jugador) => 
      total + (jugador.jugadorId.goles || 0), 0);
    return golesLocal + golesVisitante;
  }

  getTotalAsistencias(): number {
    if (!this.formacion) return 0;
    const asistenciasLocal = (this.formacion.equipos?.local?.jugadores || []).reduce((total, jugador) => 
      total + (jugador.jugadorId.asistencias || 0), 0);
    const asistenciasVisitante = (this.formacion.equipos?.visitante?.jugadores || []).reduce((total, jugador) => 
      total + (jugador.jugadorId.asistencias || 0), 0);
    return asistenciasLocal + asistenciasVisitante;
  }

  getMejorGoleador(): Jugador | null {
    if (!this.formacion) return null;
    
    const todosLosJugadores = [
      ...(this.formacion.equipos?.local?.jugadores || []).map(j => j.jugadorId),
      ...(this.formacion.equipos?.visitante?.jugadores || []).map(j => j.jugadorId)
    ];
    
    if (todosLosJugadores.length === 0) return null;
    
    return todosLosJugadores.reduce((mejor, actual) => 
      (actual.goles > mejor.goles) ? actual : mejor, todosLosJugadores[0]);
  }

  editarFormacion(): void {
    this.router.navigate(['/editar-formacion', this.formacionId]);
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