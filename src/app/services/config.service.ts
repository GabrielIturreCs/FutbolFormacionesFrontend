import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl: string;

  constructor() {
    // Determinar la URL del API basada en el entorno
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Desarrollo local
      this.apiUrl = 'http://localhost:3000';
    } else {
      // Producción - usar la URL de Render
      this.apiUrl = 'https://futbolformacionesbackend.onrender.com';
    }
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  getFullApiUrl(endpoint: string): string {
    return `${this.apiUrl}/api${endpoint}`;
  }
} 