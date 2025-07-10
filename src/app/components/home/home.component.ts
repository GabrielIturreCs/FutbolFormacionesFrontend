import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { JugadorService } from "../../services/jugador.service"
import type { Jugador } from "../../models/jugador.model"
import { Subscription } from "rxjs"
import { FormsModule } from '@angular/forms';

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
  <div class="container-fluid p-0">
    <!-- Sección Hero con estadísticas -->
    <div class="hero-section text-center py-4 bg-dark text-white">
      <div class="container">
        <h1 class="display-4 fw-bold mb-3">
          <i class="bi bi-dribbble text-warning me-3"></i>
          Campo de Fútbol
        </h1>
        <p class="lead">Gestiona tus equipos y visualiza la formación en tiempo real</p>
        <!-- Estadísticas de equipos -->
        <div class="row mt-4">
          <div class="col-md-4">
            <div class="stat-card bg-danger text-white rounded p-3">
              <i class="bi bi-people-fill fs-2"></i>
              <h3>{{ equipoRojo.length }}</h3>
              <p class="mb-0">Jugadores Rojos</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card bg-primary text-white rounded p-3">
              <i class="bi bi-people-fill fs-2"></i>
              <h3>{{ equipoAzul.length }}</h3>
              <p class="mb-0">Jugadores Azules</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card bg-success text-white rounded p-3">
              <i class="bi bi-trophy-fill fs-2"></i>
              <h3>{{ equipoRojo.length + equipoAzul.length }}</h3>
              <p class="mb-0">Total Jugadores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Contenedor de la cancha -->
    <div class="campo-container py-4">
      <div class="container">
        <!-- CANCHA DE FÚTBOL -->
        <div class="campo-futbol mx-auto position-relative"
             (dragover)="onDragOver($event)"
             (drop)="onDrop($event)">
          <!-- LÍNEAS Y ELEMENTOS DEL CAMPO -->
          <div class="linea-central"></div>
          <div class="circulo-central"></div>
          <div class="area-izquierda"></div>
          <div class="area-derecha"></div>
          <div class="area-pequena-izquierda"></div>
          <div class="area-pequena-derecha"></div>
          <div class="arco-izquierdo"></div>
          <div class="arco-derecho"></div>
          <!-- JUGADORES DEL EQUIPO ROJO -->
          <div *ngFor="let jugador of equipoRojo"
               class="jugador jugador-rojo"
               [style.left.%]="jugador.posicion.x"
               [style.top.%]="jugador.posicion.y"
               [attr.draggable]="true"
               (dragstart)="onDragStart($event, jugador)"
               (click)="editarJugador(jugador)">
            <div class="jugador-avatar">
              <i class="bi bi-person-fill"></i>
            </div>
            <div class="jugador-nombre">{{ jugador.nombre }}</div>
          </div>
          <!-- JUGADORES DEL EQUIPO AZUL -->
          <div *ngFor="let jugador of equipoAzul"
               class="jugador jugador-azul"
               [style.left.%]="jugador.posicion.x"
               [style.top.%]="jugador.posicion.y"
               [attr.draggable]="true"
               (dragstart)="onDragStart($event, jugador)"
               (click)="editarJugador(jugador)">
            <div class="jugador-avatar">
              <i class="bi bi-person-fill"></i>
            </div>
            <div class="jugador-nombre">{{ jugador.nombre }}</div>
          </div>
        </div>
        <!-- Botones de acción -->
        <div class="text-center mt-4">
          <a routerLink="/equipo-form" class="btn btn-primary btn-lg btn-custom me-3">
            <i class="bi bi-person-plus-fill me-2"></i>
            Agregar Jugadores
          </a>
          <button class="btn btn-outline-danger btn-lg btn-custom" (click)="limpiarTodo()">
            <i class="bi bi-trash-fill me-2"></i>
            Limpiar Todo
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal para editar jugador -->
  <div class="modal fade" id="editarJugadorModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Editar Jugador</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Nombre del jugador:</label>
            <input type="text" class="form-control" [(ngModel)]="jugadorEditando.nombre"
                   (keyup.enter)="guardarEdicion()">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-danger me-2" (click)="eliminarJugadorActual()">
            <i class="bi bi-trash-fill me-1"></i>
            Eliminar
          </button>
          <button type="button" class="btn btn-primary" (click)="guardarEdicion()">
            <i class="bi bi-check-lg me-1"></i>
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
  `,
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  equipoRojo: Jugador[] = [];
  equipoAzul: Jugador[] = [];
  jugadorEditando: any = { id: "", nombre: "" };
  private subscription: Subscription = new Subscription();
  private jugadorArrastrado: Jugador | null = null;

  constructor(private jugadorService: JugadorService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.jugadorService.equipos$.subscribe((equipos) => {
        this.equipoRojo = equipos.rojo;
        this.equipoAzul = equipos.azul;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // DRAG AND DROP
  onDragStart(event: DragEvent, jugador: Jugador): void {
    this.jugadorArrastrado = jugador;
    event.dataTransfer?.setData("text/plain", jugador.id);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (this.jugadorArrastrado) {
      const campo = (event.target as HTMLElement).closest('.campo-futbol') as HTMLElement;
      if (!campo) return;
      const rect = campo.getBoundingClientRect();
      let x = ((event.clientX - rect.left) / rect.width) * 100;
      let y = ((event.clientY - rect.top) / rect.height) * 100;
      // Limitar a 5%-95%
      x = Math.max(5, Math.min(95, x));
      y = Math.max(5, Math.min(95, y));
      this.jugadorService.moverJugador(this.jugadorArrastrado.id, { x, y });
      this.jugadorArrastrado = null;
    }
  }

  // EDICIÓN
  editarJugador(jugador: Jugador): void {
    this.jugadorEditando = { ...jugador };
    const modal = new (window as any).bootstrap.Modal(document.getElementById("editarJugadorModal"));
    modal.show();
  }

  guardarEdicion(): void {
    if (this.jugadorEditando.nombre.trim()) {
      this.jugadorService.editarJugador(this.jugadorEditando.id, this.jugadorEditando.nombre.trim());
      const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("editarJugadorModal"));
      modal.hide();
    }
  }

  eliminarJugadorActual(): void {
    if (confirm("¿Estás seguro de que quieres eliminar este jugador?")) {
      this.jugadorService.eliminarJugador(this.jugadorEditando.id);
      const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("editarJugadorModal"));
      modal.hide();
    }
  }

  limpiarTodo(): void {
    if (confirm("¿Estás seguro de que quieres eliminar todos los jugadores?")) {
      this.jugadorService.limpiarTodo();
    }
  }
}
