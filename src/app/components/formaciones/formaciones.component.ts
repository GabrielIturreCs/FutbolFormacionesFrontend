import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';
import { FormsModule } from '@angular/forms';

interface Jugador {
  _id: string;
  nombre: string;
  numero?: number;
  equipo: string;
  goles: number;
  asistencias: number;
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

interface Estadisticas {
  local: {
    jugadores: number;
    goles: number;
    asistencias: number;
  };
  visitante: {
    jugadores: number;
    goles: number;
    asistencias: number;
  };
  total: {
    jugadores: number;
    goles: number;
    asistencias: number;
  };
}

@Component({
  selector: 'app-formaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="hero-section text-center py-4 bg-dark text-white">
        <div class="container">
          <h1 class="display-4 fw-bold mb-3">
            <i class="bi bi-diagram-3-fill text-warning me-3"></i>
            Formaciones
          </h1>
          <p class="lead">Gestiona tus tácticas y formaciones de partido</p>
          
          <!-- Estadísticas generales en el header -->
          <div class="row mt-4">
            <div class="col-md-3">
              <div class="stat-card bg-primary text-white rounded p-3 text-center">
                <i class="bi bi-diagram-3-fill fs-2"></i>
                <h3>{{ formaciones.length }}</h3>
                <p class="mb-0">Total Formaciones</p>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card bg-success text-white rounded p-3 text-center">
                <i class="bi bi-calendar-check fs-2"></i>
                <h3>{{ formacionesActivas.length }}</h3>
                <p class="mb-0">Formaciones Activas</p>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card bg-info text-white rounded p-3 text-center">
                <i class="bi bi-people-fill fs-2"></i>
                <h3>{{ totalJugadores }}</h3>
                <p class="mb-0">Total Jugadores</p>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card bg-warning text-white rounded p-3 text-center">
                <i class="bi bi-clock-history fs-2"></i>
                <h3>{{ formacionesRecientes.length }}</h3>
                <p class="mb-0">Este Mes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="container py-4">
        <!-- Barra de acciones -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input type="text" class="form-control"
                     placeholder="Buscar formación..."
                     [(ngModel)]="filtroBusqueda"
                     (input)="filtrarFormaciones()">
            </div>
          </div>
          <div class="col-md-6 text-end">
            <a routerLink="/crear-formacion" class="btn btn-success btn-lg me-3 btn-custom">
              <i class="bi bi-plus-circle-fill me-2"></i>
              Nueva Formación
            </a>
            <a routerLink="/dashboard" class="btn btn-primary btn-lg btn-custom">
              <i class="bi bi-speedometer2 me-2"></i>
              Dashboard
            </a>
          </div>
        </div>

        <!-- Lista de formaciones -->
        <div class="row">
          <div class="col-12" *ngIf="formacionesFiltradas.length === 0">
            <div class="text-center py-5">
              <i class="bi bi-diagram-3 text-muted" style="font-size: 4rem;"></i>
              <h3 class="text-muted mt-3">No hay formaciones</h3>
              <p class="text-muted">Crea tu primera formación para comenzar</p>
              <a routerLink="/crear-formacion" class="btn btn-primary btn-lg btn-custom">
                <i class="bi bi-plus-circle me-2"></i>
                Crear Primera Formación
              </a>
            </div>
          </div>
          
          <div class="col-md-6 col-lg-4 mb-4" *ngFor="let formacion of formacionesFiltradas">
            <div class="card h-100 shadow-sm formacion-card"
                 [class.formacion-inactiva]="!formacion.activa">
              <div class="card-header d-flex justify-content-between align-items-center"
                   [style.background]="formacion.activa ? 'linear-gradient(135deg, #28a745, #20c997)' : '#6c757d'">
                <h5 class="mb-0 text-white">
                  <i class="bi bi-diagram-3 me-2"></i>
                  {{ formacion.nombre }}
                </h5>
                <span class="badge"
                      [class.bg-success]="formacion.activa"
                      [class.bg-secondary]="!formacion.activa">
                  {{ formacion.activa ? 'Activa' : 'Inactiva' }}
                </span>
              </div>
              
              <div class="card-body">
                <p class="text-muted mb-3" *ngIf="formacion.descripcion">
                  {{ formacion.descripcion }}
                </p>
                
                <!-- Vista previa de la cancha -->
                <div class="campo-preview mb-3">
                  <div class="campo-mini">
                    <!-- Líneas básicas del campo -->
                    <div class="linea-central-mini"></div>
                    <div class="circulo-central-mini"></div>
                    
                    <!-- Jugadores del equipo local -->
                    <div *ngFor="let jugador of formacion.equipos.local.jugadores" 
                         class="jugador-mini jugador-local-mini"
                         [style.left.%]="jugador.posicion.x"
                         [style.top.%]="jugador.posicion.y"
                         [style.background-color]="formacion.equipos.local.color">
                    </div>
                    
                    <!-- Jugadores del equipo visitante -->
                    <div *ngFor="let jugador of formacion.equipos.visitante.jugadores" 
                         class="jugador-mini jugador-visitante-mini"
                         [style.left.%]="jugador.posicion.x"
                         [style.top.%]="jugador.posicion.y"
                         [style.background-color]="formacion.equipos.visitante.color">
                    </div>
                  </div>
                </div>
                
                <div class="row mb-3">
                  <div class="col-6">
                    <div class="equipo-info">
                      <div class="equipo-color"
                           [style.background-color]="formacion.equipos.local.color"></div>
                      <div>
                        <strong>{{ formacion.equipos.local.nombre }}</strong>
                        <br>
                        <small class="text-muted">{{ formacion.equipos.local.jugadores.length }} jugadores</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="equipo-info">
                      <div class="equipo-color"
                           [style.background-color]="formacion.equipos.visitante.color"></div>
                      <div>
                        <strong>{{ formacion.equipos.visitante.nombre }}</strong>
                        <br>
                        <small class="text-muted">{{ formacion.equipos.visitante.jugadores.length }} jugadores</small>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="stats-row">
                  <div class="stat-item">
                    <i class="bi bi-people-fill text-primary"></i>
                    <span>{{ getTotalJugadores(formacion) }}</span>
                    <small>Jugadores</small>
                  </div>
                  <div class="stat-item">
                    <i class="bi bi-dribbble text-success"></i>
                    <span>{{ getTotalGoles(formacion) }}</span>
                    <small>Goles</small>
                  </div>
                  <div class="stat-item">
                    <i class="bi bi-arrow-up-circle text-info"></i>
                    <span>{{ getTotalAsistencias(formacion) }}</span>
                    <small>Asistencias</small>
                  </div>
                </div>
                
                <div class="text-muted small mt-3">
                  <i class="bi bi-calendar me-1"></i>
                  {{ formacion.fecha | date:'dd/MM/yyyy HH:mm' }}
                </div>
              </div>
              
              <div class="card-footer bg-transparent">
                <div class="btn-group w-100" role="group">
                  <a [routerLink]="['/formacion', formacion._id]"
                     class="btn btn-outline-success btn-sm">
                    <i class="bi bi-eye me-1"></i>
                    Ver en Campo
                  </a>
                  <a [routerLink]="['/editar-formacion', formacion._id]"
                     class="btn btn-outline-warning btn-sm">
                    <i class="bi bi-pencil me-1"></i>
                    Editar
                  </a>
                  <button class="btn btn-outline-danger btn-sm"
                          (click)="eliminarFormacion(formacion)">
                    <i class="bi bi-trash me-1"></i>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="text-center mt-4">
          <button class="btn btn-primary btn-lg me-3 btn-custom" (click)="cargarFormaciones()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Actualizar
          </button>
          <a routerLink="/" class="btn btn-outline-secondary btn-lg me-3 btn-custom">
            <i class="bi bi-house me-2"></i>
            Volver al Campo
          </a>
          <a routerLink="/gestion-jugadores" class="btn btn-warning btn-lg btn-custom">
            <i class="bi bi-gear me-2"></i>
            Gestión Jugadores
          </a>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div class="modal fade" id="confirmModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Eliminar Formación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que quieres eliminar la formación <strong>{{ formacionSeleccionada?.nombre }}</strong>?</p>
            <p class="text-muted">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" (click)="confirmarEliminar()">
              <i class="bi bi-trash me-1"></i>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./formaciones.component.scss']
})
export class FormacionesComponent implements OnInit {
  formaciones: Formacion[] = [];
  formacionesFiltradas: Formacion[] = [];
  filtroBusqueda = '';
  formacionSeleccionada: Formacion | null = null;

  constructor(private http: HttpClient, private configService: ConfigService) {}

  ngOnInit(): void {
    this.cargarFormaciones();
  }

  cargarFormaciones(): void {
    this.http.get<any>(this.configService.getFullApiUrl('/formaciones'))
      .subscribe({
        next: (response) => {
          this.formaciones = response.data;
          this.filtrarFormaciones();
        },
        error: (error) => {
          console.error('Error cargando formaciones:', error);
        }
      });
  }

  filtrarFormaciones(): void {
    if (!this.filtroBusqueda.trim()) {
      this.formacionesFiltradas = this.formaciones;
    } else {
      this.formacionesFiltradas = this.formaciones.filter(formacion =>
        formacion.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        (formacion.descripcion && formacion.descripcion.toLowerCase().includes(this.filtroBusqueda.toLowerCase())) ||
        formacion.equipos.local.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        formacion.equipos.visitante.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase())
      );
    }
  }

  eliminarFormacion(formacion: Formacion): void {
    this.formacionSeleccionada = formacion;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
  }

  confirmarEliminar(): void {
    if (!this.formacionSeleccionada) return;
        
    this.http.delete<any>(`${this.configService.getApiUrl()}/api/formaciones/${this.formacionSeleccionada._id}`)
      .subscribe({
        next: () => {
          this.cargarFormaciones();
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
          modal.hide();
        },
        error: (error) => {
          console.error('Error eliminando formación:', error);
        }
      });
  }

  getTotalJugadores(formacion: Formacion): number {
    return formacion.equipos.local.jugadores.length + formacion.equipos.visitante.jugadores.length;
  }

  getTotalGoles(formacion: Formacion): number {
    const golesLocal = formacion.equipos.local.jugadores.reduce((total, jugador) => 
      total + (jugador.jugadorId.goles || 0), 0);
    const golesVisitante = formacion.equipos.visitante.jugadores.reduce((total, jugador) => 
      total + (jugador.jugadorId.goles || 0), 0);
    return golesLocal + golesVisitante;
  }

  getTotalAsistencias(formacion: Formacion): number {
    const asistenciasLocal = formacion.equipos.local.jugadores.reduce((total, jugador) => 
      total + (jugador.jugadorId.asistencias || 0), 0);
    const asistenciasVisitante = formacion.equipos.visitante.jugadores.reduce((total, jugador) => 
      total + (jugador.jugadorId.asistencias || 0), 0);
    return asistenciasLocal + asistenciasVisitante;
  }

  // Función robusta para obtener la URL de la foto del jugador
  getFotoUrl(jugador: any): string {
    if (!jugador) return '';
    if (jugador.fotoUrl && jugador.fotoUrl.startsWith('http')) {
      return jugador.fotoUrl;
    }
    return '';
  }

  get formacionesActivas(): Formacion[] {
    return this.formaciones.filter(f => f.activa);
  }

  get formacionesRecientes(): Formacion[] {
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 1);
    return this.formaciones.filter(f => new Date(f.fecha) > unMesAtras);
  }

  get totalJugadores(): number {
    return this.formaciones.reduce((total, formacion) => 
      total + this.getTotalJugadores(formacion), 0);
  }
}