import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';

interface Estadisticas {
  totalJugadores: number;
  totalFormaciones: number;
  totalGoles: number;
  totalAsistencias: number;
  jugadoresRojos: number;
  jugadoresAzules: number;
  formacionesActivas: number;
  formacionesRecientes: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="hero-section text-center py-4 bg-dark text-white">
        <div class="container">
          <h1 class="display-4 fw-bold mb-3">
            <i class="bi bi-speedometer2 text-warning me-3"></i>
            Dashboard
          </h1>
          <p class="lead">Panel de control y estadísticas del sistema</p>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="container py-4">
        <!-- Estadísticas principales -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="stat-card bg-primary text-white rounded p-3 text-center">
              <i class="bi bi-people-fill fs-2"></i>
              <h3>{{ estadisticas.totalJugadores }}</h3>
              <p class="mb-0">Total Jugadores</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card bg-success text-white rounded p-3 text-center">
              <i class="bi bi-diagram-3-fill fs-2"></i>
              <h3>{{ estadisticas.totalFormaciones }}</h3>
              <p class="mb-0">Formaciones</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card bg-warning text-white rounded p-3 text-center">
              <i class="bi bi-dribbble fs-2"></i>
              <h3>{{ estadisticas.totalGoles }}</h3>
              <p class="mb-0">Total Goles</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card bg-info text-white rounded p-3 text-center">
              <i class="bi bi-arrow-up-circle fs-2"></i>
              <h3>{{ estadisticas.totalAsistencias }}</h3>
              <p class="mb-0">Asistencias</p>
            </div>
          </div>
        </div>

        <!-- Estadísticas detalladas -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5><i class="bi bi-pie-chart me-2"></i>Distribución de Equipos</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-6">
                    <div class="equipo-stat">
                      <div class="equipo-color bg-danger"></div>
                      <div>
                        <h4>{{ estadisticas.jugadoresRojos }}</h4>
                        <p>Equipo Rojo</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="equipo-stat">
                      <div class="equipo-color bg-primary"></div>
                      <div>
                        <h4>{{ estadisticas.jugadoresAzules }}</h4>
                        <p>Equipo Azul</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5><i class="bi bi-calendar-check me-2"></i>Estado de Formaciones</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-6">
                    <div class="formacion-stat">
                      <i class="bi bi-check-circle text-success fs-1"></i>
                      <div>
                        <h4>{{ estadisticas.formacionesActivas }}</h4>
                        <p>Formaciones Activas</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="formacion-stat">
                      <i class="bi bi-clock-history text-warning fs-1"></i>
                      <div>
                        <h4>{{ estadisticas.formacionesRecientes }}</h4>
                        <p>Este Mes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navegación Principal -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="bi bi-compass me-2"></i>Navegación Principal</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3 mb-4">
                    <div class="nav-card bg-primary text-white rounded p-4 text-center h-100">
                      <i class="bi bi-people-fill fs-1 mb-3"></i>
                      <h4>Gestión Jugadores</h4>
                      <p class="mb-3">Administra tu plantel completo</p>
                      <a routerLink="/gestion-jugadores" class="btn btn-light btn-lg w-100">
                        <i class="bi bi-arrow-right me-2"></i>
                        Entrar
                      </a>
                    </div>
                  </div>
                  <div class="col-md-3 mb-4">
                    <div class="nav-card bg-success text-white rounded p-4 text-center h-100">
                      <i class="bi bi-diagram-3-fill fs-1 mb-3"></i>
                      <h4>Formaciones</h4>
                      <p class="mb-3">Crea y gestiona tácticas</p>
                      <a routerLink="/formaciones" class="btn btn-light btn-lg w-100">
                        <i class="bi bi-arrow-right me-2"></i>
                        Entrar
                      </a>
                    </div>
                  </div>
                  <div class="col-md-3 mb-4">
                    <div class="nav-card bg-warning text-dark rounded p-4 text-center h-100">
                      <i class="bi bi-trophy-fill fs-1 mb-3"></i>
                      <h4>Top Goleadores</h4>
                      <p class="mb-3">Ranking de mejores jugadores</p>
                      <a routerLink="/top-goleadores" class="btn btn-dark btn-lg w-100">
                        <i class="bi bi-arrow-right me-2"></i>
                        Entrar
                      </a>
                    </div>
                  </div>
                  <div class="col-md-3 mb-4">
                    <div class="nav-card bg-info text-white rounded p-4 text-center h-100">
                      <i class="bi bi-plus-circle fs-1 mb-3"></i>
                      <h4>Nueva Formación</h4>
                      <p class="mb-3">Crea una nueva táctica</p>
                      <a routerLink="/crear-formacion" class="btn btn-light btn-lg w-100">
                        <i class="bi bi-arrow-right me-2"></i>
                        Crear
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráficos y métricas -->
        <div class="row">
          <div class="col-md-8">
            <div class="card">
              <div class="card-header">
                <h5><i class="bi bi-graph-up me-2"></i>Actividad Reciente</h5>
              </div>
              <div class="card-body">
                <div class="activity-timeline">
                  <div class="activity-item">
                    <div class="activity-icon bg-success">
                      <i class="bi bi-person-plus"></i>
                    </div>
                    <div class="activity-content">
                      <h6>Nuevos Jugadores</h6>
                      <p class="text-muted">Se han agregado {{ estadisticas.totalJugadores }} jugadores al sistema</p>
                    </div>
                  </div>
                  <div class="activity-item">
                    <div class="activity-icon bg-primary">
                      <i class="bi bi-diagram-3"></i>
                    </div>
                    <div class="activity-content">
                      <h6>Formaciones Creadas</h6>
                      <p class="text-muted">{{ estadisticas.totalFormaciones }} formaciones han sido creadas</p>
                    </div>
                  </div>
                  <div class="activity-item">
                    <div class="activity-icon bg-warning">
                      <i class="bi bi-dribbble"></i>
                    </div>
                    <div class="activity-content">
                      <h6>Goles Marcados</h6>
                      <p class="text-muted">Se han registrado {{ estadisticas.totalGoles }} goles en total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <h5><i class="bi bi-info-circle me-2"></i>Información del Sistema</h5>
              </div>
              <div class="card-body">
                <div class="info-item">
                  <i class="bi bi-check-circle text-success"></i>
                  <span>Sistema funcionando correctamente</span>
                </div>
                <div class="info-item">
                  <i class="bi bi-database text-primary"></i>
                  <span>Base de datos conectada</span>
                </div>
                <div class="info-item">
                  <i class="bi bi-clock text-warning"></i>
                  <span>Última actualización: {{ fechaActual | date:'short' }}</span>
                </div>
                <div class="info-item">
                  <i class="bi bi-people text-info"></i>
                  <span>{{ estadisticas.totalJugadores }} jugadores registrados</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de navegación -->
        <div class="text-center mt-4">
          <a routerLink="/" class="btn btn-outline-secondary btn-lg me-3">
            <i class="bi bi-house me-2"></i>
            Volver al Campo
          </a>
          <button class="btn btn-primary btn-lg" (click)="actualizarEstadisticas()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Actualizar Estadísticas
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  estadisticas: Estadisticas = {
    totalJugadores: 0,
    totalFormaciones: 0,
    totalGoles: 0,
    totalAsistencias: 0,
    jugadoresRojos: 0,
    jugadoresAzules: 0,
    formacionesActivas: 0,
    formacionesRecientes: 0
  };
  
  fechaActual = new Date();

  constructor(private http: HttpClient, private configService: ConfigService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    // Cargar estadísticas de jugadores
    this.http.get<any>(this.configService.getFullApiUrl('/jugadores'))
      .subscribe({
        next: (response) => {
          const jugadores = response.data;
          this.estadisticas.totalJugadores = jugadores.length;
          this.estadisticas.jugadoresRojos = jugadores.filter((j: any) => j.equipo === 'rojo').length;
          this.estadisticas.jugadoresAzules = jugadores.filter((j: any) => j.equipo === 'azul').length;
          this.estadisticas.totalGoles = jugadores.reduce((total: number, j: any) => total + (j.goles || 0), 0);
          this.estadisticas.totalAsistencias = jugadores.reduce((total: number, j: any) => total + (j.asistencias || 0), 0);
        },
        error: (error) => {
          console.error('Error cargando estadísticas de jugadores:', error);
        }
      });

    // Cargar estadísticas de formaciones
    this.http.get<any>(this.configService.getFullApiUrl('/formaciones'))
      .subscribe({
        next: (response) => {
          const formaciones = response.data;
          this.estadisticas.totalFormaciones = formaciones.length;
          this.estadisticas.formacionesActivas = formaciones.filter((f: any) => f.activa).length;
          
          const unMesAtras = new Date();
          unMesAtras.setMonth(unMesAtras.getMonth() - 1);
          this.estadisticas.formacionesRecientes = formaciones.filter((f: any) => 
            new Date(f.fecha) > unMesAtras
          ).length;
        },
        error: (error) => {
          console.error('Error cargando estadísticas de formaciones:', error);
        }
      });
  }

  actualizarEstadisticas(): void {
    this.cargarEstadisticas();
    this.fechaActual = new Date();
  }
} 