import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Estado } from '../models/Estado.model';
import { Prioridad } from '../models/Prioridad.model';
import { Colaborador } from '../models/Colaborador.model';

@Injectable({
  providedIn: 'root'
})
export class TareasService {


  private apiUrl = 'http://localhost:5284/WeatherForecast/DatosIniciales';
  private apiUrlCombox = 'http://localhost:5284/WeatherForecast/CargoCombox';
  private apiUrlDel = 'http://localhost:5284/WeatherForecast/EliminarDato';
  private apiUrlAdd = 'http://localhost:5284/WeatherForecast/AgregarDato';
  private apiUrlEdit = 'http://localhost:5284/WeatherForecast/EditarDato';
  
  constructor(private http: HttpClient) { }
  getTasks(params: any = {}): Observable<any[]> {
    let httpParams = new HttpParams();

    // Agrega los parámetros solo si están presentes
    if (params.idTarea) {
        httpParams = httpParams.set('idTarea', params.idTarea);
    }
    if (params.idColaborador) {
        httpParams = httpParams.set('idColaborador', params.idColaborador);
    }
    if (params.idEstado) {
        httpParams = httpParams.set('idEstado', params.idEstado);
    }
    if (params.idPrioridad) {
        httpParams = httpParams.set('idPrioridad', params.idPrioridad);
    }
    if (params.fechaInicio) {
        httpParams = httpParams.set('fechaInicio', params.fechaInicio);
    }
    if (params.fechaFin) {
        httpParams = httpParams.set('fechaFin', params.fechaFin);
    }

    return this.http.get<any[]>(this.apiUrl, { params: httpParams }).pipe(
        map(response => 
            response.map(item => ({
                id: item.Id_Tarea,
                description: item.Descripcion,
                assignedTo: item.Id_Colaborador,
                createdAt: this.formatDate(item.Fecha_Inicio),
                priority: item.Id_Prioridad,
                state: item.Id_Estado,
                startDate: item.Fecha_Inicio.split('T')[0],
                endDate: item.Fecha_Fin.split('T')[0],
                isHighlighted: true
            }))
        )
    );
}

 /* getTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(response => 
        response.map(item => ({
          id: item.Id_Tarea,
          description: item.Descripcion,
          assignedTo: item.Id_Colaborador,
          createdAt: this.formatDate(item.Fecha_Inicio),
          priority: item.Id_Prioridad,
          state: item.Id_Estado,
          startDate: item.Fecha_Inicio.split('T')[0], //this.convertToDate(item.Fecha_Inicio),
          endDate: item.Fecha_Fin.split('T')[0],
          isHighlighted: true
        }))
      )
    );
  }*/

  getCombos(): Observable<{ Estados: Estado[], Prioridades: Prioridad[], Colaboradores: Colaborador[] }> {
    return this.http.get<any>(this.apiUrlCombox).pipe(
      map(response => {
        return {
          Estados: response.Estados as Estado[],
          Prioridades: response.Prioridades as Prioridad[],
          Colaboradores: response.Colaboradores as Colaborador[]
        };
      })
    );
  }

  deleteTask(body: any) {
   return this.http.post<string>(this.apiUrlDel, body, { responseType: 'text' as 'json' });
  }
  AddTask(body: any){
   return this.http.post<string>(this.apiUrlAdd, body, { responseType: 'text' as 'json' })
  }

  editTask(body: any){
    return this.http.post<string>(this.apiUrlEdit, body, { responseType: 'text' as 'json' })
   }
  

  private formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }


}
