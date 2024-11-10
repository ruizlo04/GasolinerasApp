import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GasolineraService {
  private comunidadesUrl = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/ComunidadesAutonomas/';
  private provinciasUrl = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/Provincias/';

  constructor(private http: HttpClient) {}

  getGasolineras(): Observable<any[]> { 
    return this.http.get<any[]>('http://localhost:3000/ListaEESSPrecio');
  }

  getComunidadesAutonomas(): Observable<any> { 
    return this.http.get<any>(this.comunidadesUrl);
  }

  getProvinciasByComunidad(idCCAA: string): Observable<any[]> {
    const url = `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/ProvinciasPorComunidad/${idCCAA}`;
    return this.http.get<any[]>(url);  
  }

  getProvincias(): Observable<any[]> {
    return this.http.get<any[]>(this.provinciasUrl);
  }
}
