import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { JugadorService } from "../../services/jugador.service"
import type { Jugador } from "../../models/jugador.model"
import { Subscription } from "rxjs"
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: "app-equipo-form",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  template: `
    <div class="container py-4">
      <div class="row">
        <div class="col-12">
          <div class="text-center mb-5">
            <h1 class="display-4 fw-bold text-white mb-3">
              <i class="bi bi-people-fill text-warning me-3"></i>
              Gestión de Equipos
            </h1>
            <p class="lead text-white-50">Agrega, edita y organiza los jugadores de ambos equipos</p>
          </div>
        </div>
      </div>

      <!-- Formulario para agregar jugadores -->
      <div class="row mb-5">
        <div class="col-lg-6 mx-auto">
          <div class="card shadow-custom">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">
                <i class="bi bi-person-plus-fill me-2"></i>
                Agregar Nuevo Jugador
              </h4>
            </div>
            <div class="card-body">
              <form (ngSubmit)="agregarJugador()" #jugadorForm="ngForm">
                <div class="text-center mb-4">
                  <div class="foto-preview-wrapper mx-auto mb-2">
                    <img *ngIf="fotoPreview" [src]="fotoPreview" class="foto-preview" alt="Foto jugador" />
                    <div *ngIf="!fotoPreview" class="foto-preview placeholder">
                      <i class="bi bi-person-circle"></i>
                    </div>
                  </div>
                  <button *ngIf="fotoPreview" type="button" class="btn btn-sm btn-outline-danger mt-1" (click)="quitarFoto()">
                    Quitar foto
                  </button>
                </div>
                <div class="mb-3">
                  <label for="nombreJugador" class="form-label fw-bold">Nombre del Jugador</label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    id="nombreJugador"
                    [(ngModel)]="nuevoJugador.nombre" 
                    name="nombreJugador"
                    placeholder="Ingresa el nombre del jugador"
                    required
                    #nombreInput="ngModel">
                  <div *ngIf="nombreInput.invalid && nombreInput.touched" class="text-danger mt-1">
                    El nombre es requerido
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">Foto del Jugador (opcional)</label>
                  <input type="file" accept="image/jpeg,image/png" class="form-control" (change)="onFotoSelected($event)">
                  <div *ngIf="errorFoto" class="text-danger mt-1">{{ errorFoto }}</div>
                  <div *ngIf="subiendoFoto" class="text-info mt-1">Subiendo imagen...</div>
                </div>
                
                <div class="mb-4">
                  <label class="form-label fw-bold">Seleccionar Equipo</label>
                  <div class="row">
                    <div class="col-6">
                      <div class="form-check form-check-lg">
                        <input 
                          class="form-check-input" 
                          type="radio" 
                          name="equipo" 
                          id="equipoRojo"
                          value="rojo" 
                          [(ngModel)]="nuevoJugador.equipo"
                          required>
                        <label class="form-check-label text-danger fw-bold" for="equipoRojo">
                          <i class="bi bi-circle-fill me-2"></i>
                          Equipo Rojo
                        </label>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="form-check form-check-lg">
                        <input 
                          class="form-check-input" 
                          type="radio" 
                          name="equipo" 
                          id="equipoAzul"
                          value="azul" 
                          [(ngModel)]="nuevoJugador.equipo"
                          required>
                        <label class="form-check-label text-primary fw-bold" for="equipoAzul">
                          <i class="bi bi-circle-fill me-2"></i>
                          Equipo Azul
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="d-grid gap-2">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg btn-custom"
                    [disabled]="jugadorForm.invalid || subiendoFoto">
                    <i class="bi bi-plus-circle-fill me-2"></i>
                    Agregar Jugador
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Equipos -->
      <div class="row">
        <!-- Equipo Rojo -->
        <div class="col-lg-6 mb-4">
          <div class="card shadow-custom h-100">
            <div class="card-header bg-danger text-white d-flex justify-content-between align-items-center">
              <h4 class="mb-0">
                <i class="bi bi-people-fill me-2"></i>
                Equipo Rojo ({{ equipoRojo.length }})
              </h4>
              <button 
                class="btn btn-outline-light btn-sm" 
                (click)="limpiarEquipo('rojo')"
                [disabled]="equipoRojo.length === 0">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
            <div class="card-body">
              <div *ngIf="equipoRojo.length === 0" class="text-center text-muted py-4">
                <i class="bi bi-person-x fs-1 mb-3"></i>
                <p>No hay jugadores en el equipo rojo</p>
              </div>
              
              <div *ngFor="let jugador of equipoRojo; let i = index" 
                   class="jugador-item jugador-rojo mb-3 p-3 rounded">
                <div class="d-flex align-items-center">
                  <div class="jugador-avatar-small me-3">
                    <i class="bi bi-person-fill"></i>
                  </div>
                  <div class="flex-grow-1">
                    <h6 class="mb-1 fw-bold">{{ jugador.nombre }}</h6>
                    <small class="text-muted">Jugador #{{ i + 1 }}</small>
                  </div>
                  <div class="btn-group">
                    <button 
                      class="btn btn-outline-primary btn-sm" 
                      (click)="editarJugadorEnLista(jugador)">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger btn-sm" 
                      (click)="eliminarJugador(jugador.id)">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Equipo Azul -->
        <div class="col-lg-6 mb-4">
          <div class="card shadow-custom h-100">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 class="mb-0">
                <i class="bi bi-people-fill me-2"></i>
                Equipo Azul ({{ equipoAzul.length }})
              </h4>
              <button 
                class="btn btn-outline-light btn-sm" 
                (click)="limpiarEquipo('azul')"
                [disabled]="equipoAzul.length === 0">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
            <div class="card-body">
              <div *ngIf="equipoAzul.length === 0" class="text-center text-muted py-4">
                <i class="bi bi-person-x fs-1 mb-3"></i>
                <p>No hay jugadores en el equipo azul</p>
              </div>
              
              <div *ngFor="let jugador of equipoAzul; let i = index" 
                   class="jugador-item jugador-azul mb-3 p-3 rounded">
                <div class="d-flex align-items-center">
                  <div class="jugador-avatar-small me-3">
                    <i class="bi bi-person-fill"></i>
                  </div>
                  <div class="flex-grow-1">
                    <h6 class="mb-1 fw-bold">{{ jugador.nombre }}</h6>
                    <small class="text-muted">Jugador #{{ i + 1 }}</small>
                  </div>
                  <div class="btn-group">
                    <button 
                      class="btn btn-outline-primary btn-sm" 
                      (click)="editarJugadorEnLista(jugador)">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger btn-sm" 
                      (click)="eliminarJugador(jugador.id)">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="row mt-4">
        <div class="col-12 text-center">
          <a routerLink="/" class="btn btn-success btn-lg btn-custom me-3">
            <i class="bi bi-eye-fill me-2"></i>
            Ver Cancha
          </a>
          <button class="btn btn-outline-danger btn-lg btn-custom" (click)="limpiarTodo()">
            <i class="bi bi-trash-fill me-2"></i>
            Limpiar Todo
          </button>
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
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="jugadorEditando.nombre" 
                (keyup.enter)="guardarEdicion()">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="guardarEdicion()">
              <i class="bi bi-check-lg me-1"></i>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./equipo-form.component.scss"],
})
export class EquipoFormComponent implements OnInit, OnDestroy {
  equipoRojo: Jugador[] = []
  equipoAzul: Jugador[] = []
  nuevoJugador: any = { nombre: '', equipo: '', fotoUrl: '' };
  jugadorEditando: any = { id: '', nombre: '' };
  private subscription: Subscription = new Subscription();

  // Para la foto
  fotoFile: File | null = null;
  fotoPreview: string | null = null;
  subiendoFoto: boolean = false;
  errorFoto: string = '';

  constructor(private jugadorService: JugadorService, private http: HttpClient) {}

  ngOnInit(): void {
    this.subscription.add(
      this.jugadorService.equipos$.subscribe((equipos) => {
        this.equipoRojo = equipos.rojo
        this.equipoAzul = equipos.azul
      }),
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

  onFotoSelected(event: any): void {
    this.errorFoto = '';
    const file = event.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.errorFoto = 'Solo se permiten imágenes JPG o PNG';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.errorFoto = 'La imagen no puede superar los 2MB';
      return;
    }
    this.fotoFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fotoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  quitarFoto(): void {
    this.fotoFile = null;
    this.fotoPreview = null;
    this.nuevoJugador.fotoUrl = '';
  }

  agregarJugador(): void {
    if (this.fotoFile) {
      this.subiendoFoto = true;
      const formData = new FormData();
      formData.append('foto', this.fotoFile);
      this.http.post<{ url: string }>('/api/jugadores/upload-foto', formData).subscribe({
        next: (res) => {
          this.nuevoJugador.fotoUrl = res.url;
          this.subiendoFoto = false;
          this.guardarJugador();
        },
        error: (err) => {
          this.errorFoto = err.error?.error || 'Error al subir la imagen';
          this.subiendoFoto = false;
        }
      });
    } else {
      this.guardarJugador();
    }
  }

  guardarJugador(): void {
    this.jugadorService.agregarJugador({
      nombre: this.nuevoJugador.nombre,
      equipo: this.nuevoJugador.equipo,
      fotoUrl: this.nuevoJugador.fotoUrl || undefined
    });
    this.nuevoJugador = { nombre: '', equipo: '', fotoUrl: '' };
    this.fotoFile = null;
    this.fotoPreview = null;
    this.errorFoto = '';
  }

  editarJugadorEnLista(jugador: Jugador): void {
    this.jugadorEditando = { ...jugador };
    this.nuevoJugador = { nombre: jugador.nombre, equipo: jugador.equipo, fotoUrl: jugador.fotoUrl };
    const modal = new (window as any).bootstrap.Modal(document.getElementById("editarJugadorModal"))
    modal.show()
  }

  guardarEdicion(): void {
    if (this.fotoFile) {
      this.subiendoFoto = true;
      const formData = new FormData();
      formData.append('foto', this.fotoFile);
      this.http.post<{ url: string }>('/api/jugadores/upload-foto', formData).subscribe({
        next: (res) => {
          this.nuevoJugador.fotoUrl = res.url;
          this.subiendoFoto = false;
          this.guardarEdicionFinal();
        },
        error: (err) => {
          this.errorFoto = err.error?.error || 'Error al subir la imagen';
          this.subiendoFoto = false;
        }
      });
    } else {
      this.guardarEdicionFinal();
    }
  }

  guardarEdicionFinal(): void {
    this.jugadorService.editarJugador(this.jugadorEditando.id, this.nuevoJugador.nombre, this.nuevoJugador.fotoUrl || undefined);
    this.nuevoJugador = { nombre: '', equipo: '', fotoUrl: '' };
    this.fotoFile = null;
    this.fotoPreview = null;
    this.errorFoto = '';
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("editarJugadorModal"));
    modal.hide();
  }

  eliminarJugador(id: string): void {
    if (confirm("¿Estás seguro de que quieres eliminar este jugador?")) {
      this.jugadorService.eliminarJugador(id)
    }
  }

  limpiarEquipo(equipo: "rojo" | "azul"): void {
    const nombreEquipo = equipo === "rojo" ? "Rojo" : "Azul"
    if (confirm(`¿Estás seguro de que quieres eliminar todos los jugadores del equipo ${nombreEquipo}?`)) {
      this.jugadorService.limpiarEquipo(equipo)
    }
  }

  limpiarTodo(): void {
    if (confirm("¿Estás seguro de que quieres eliminar todos los jugadores de ambos equipos?")) {
      this.jugadorService.limpiarTodo()
    }
  }
}
