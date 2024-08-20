
import { Component, OnInit } from '@angular/core';
import { TareasService } from '../services/tareas.service';
import { Colaborador } from '../models/Colaborador.model';
import { Prioridad } from '../models/Prioridad.model';
import { Estado } from '../models/Estado.model';
declare var Swal: any; // Declarar Swal para que TypeScript lo reconozca
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isHighlighted: boolean = true; // Cambia esto para probar
 
 
   tasks:any;
   prioridades: Prioridad[] = [];
   estados:Estado[] =[];
   colaboradores:Colaborador[] =[];
  
  constructor(private tareasService: TareasService){
 
  }
  ngOnInit(): void {
   this.ObtenerTareasLista();
    ///Obtengo Combos
    this.tareasService.getCombos().subscribe(
      data => {
        this.estados = data.Estados;
        this.prioridades = data.Prioridades;
        this.colaboradores = data.Colaboradores;
        
      },
      error => {
        console.error('Error al cargar los datos', error);
      }
    );


  }

  ObtenerTareasLista(params?:any){

 this.tareasService.getTasks(params).subscribe(
  (tasks) => {
    this.tasks = tasks;
    console.log(tasks);
  },
  (error) => {
    console.error('Error al hacer la solicitud:', error);
  }
);
  }
  

  EditDescripcion(task:any){
    
    if(task.isHighlighted==true)
      {
     return;
     }
      Swal.fire({
        title: 'Editar Descripción',
        html: `
          <div class="form-container">
           
            <textarea id="description" class="swal2-textarea" placeholder="Descripción">${task.description}</textarea>
  
          </div>
        `,
        focusConfirm: false,
        customClass: {
          container: 'swal2-container',
          popup: 'swal2-popup',
          header: 'swal2-header',
          title: 'swal2-title',
          content: 'swal2-content',
          input: 'swal2-input',
          select: 'swal2-select',
        },
        preConfirm: () => {
          const description = (document.getElementById('description') as HTMLInputElement).value;
         
    
          if (!description) {
            Swal.showValidationMessage('Por favor complete la descripción');
            return null;
          }
    
          task.description=description;
          return {
            description: description
            
          };
        }
      }).then((result: any) => {
        if (result.isConfirmed) {
          
          // Aquí puedes manejar los datos recibidos, como enviarlos a un servidor o actualizarlos en la UI
        }
      });
  
    
  }
  Eliminar(task:any){
    
      
      if (task.state === 1) { // Asumiendo que '1' es el valor para una tarea en proceso
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se puede eliminar una tarea que esta (EN PROCESO)',
          confirmButtonText: 'Aceptar'
        });
      
        return; // Salir del método si la validación falla
      }
     Swal.fire({
      title: "Desea eliminar la tarea?",
      text: "Después de eliminar no hay forma de revertirlo!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar tarea!"
     }).then((result:any) => {
      if (result.isConfirmed) {

       let body=new FormData();
       body.append("id",task.id);
       this.tareasService.deleteTask(body).subscribe(
        (resp) => {
          // Mostrar el mensaje en un alert
          
          Swal.fire({
            title: "Eliminada!",
            text: resp,
            icon: "success"
          });
          this.tasks = [];
          this.ObtenerTareasLista();
        },
        (error) => {

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Algo salió mal. Por favor, inténtalo de nuevo.'
            
          });
        }
       );



       
      }
     });
  }

  ValidoEditar(dato:any){

  

    if (dato.state === 3) { // Asumiendo que '3' es el valor para una tarea finalizada
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede editar una tarea que ya está FINALIZADA.',
        confirmButtonText: 'Aceptar'
      });
      
      return; // Salir del método si la validación falla
    }else{
      dato.isHighlighted = !dato.isHighlighted;
    }
   

   
  }

  Editar(dato:any){
 
   // Convertir fechas al formato YYYY-MM-DD
    const startDate = new Date(dato.startDate).toISOString().split('T')[0];
    const endDate = new Date(dato.endDate).toISOString().split('T')[0];

    // Validar si la fecha de inicio es mayor que la fecha de fin
    if (new Date(startDate) > new Date(endDate)) {
    
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La fecha de inicio no puede ser mayor que la fecha de fin.',
        confirmButtonText: 'Aceptar'
      });
      return; // Salir del método si la validación falla
    }
    
    // Validar si la tarea ya está finalizada
    if (dato.state === 3) { // Asumiendo que '3' es el valor para una tarea finalizada
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede editar una tarea que ya está FINALIZADA.',
        confirmButtonText: 'Aceptar'
      });
      dato.isHighlighted = !dato.isHighlighted;
      return; // Salir del método si la validación falla
    }
    
   
    let body=new FormData();
    body.append("idtarea",dato.id);
    body.append("descripcion",dato.description);
    body.append("prioridad",dato.priority);
    body.append("colaborador",dato.assignedTo);
    body.append("estado",dato.state);
    body.append("FechaInicio",startDate);
    body.append("FechaFin",dato.endDate);
    console.log(dato.endDate);

    this.tareasService.editTask(body).subscribe(
      (response) => {
     
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Tarea editada exitosamente",
          showConfirmButton: false,
          timer: 1500
        });
       this.ObtenerTareasLista();
      },
      (error) => {
        console.log('Error al agregar la tarea:', error);
      }
    );
    // Cambiar el estado de isHighlighted si las validaciones pasan
    dato.isHighlighted = !dato.isHighlighted;
 
  }
 
  ///
  Agregar(){
  
    const prioridadOptions = this.prioridades.map(p => 
      `<option value="${p.Id_Prioridad}">${p.Prioridad}</option>`
    ).join('');

    const estadoOptions = this.estados.map(e => 
      `<option value="${e.Id_Estado}" ${e.Id_Estado === 2 ? 'selected' : ''}>${e.Estado}</option>`
    ).join('');
    

    const colaboradorOptions = this.colaboradores.map(c => 
      `<option value="${c.Id_Colaborador}">${c.Nombre}</option>`
    ).join('');
     
    Swal.fire({
      title: 'Agregar Tarea',
      html: `
        <div class="form-container">
          <div class="mb-3 ms-4">
             <label for="addprioridad" class="form-label" style="font-weight: bold;">Prioridad</label>
            <select id="addprioridad" class="swal2-select">
              <option value="" selected disabled>Seleccione una opción</option>
              ${prioridadOptions}
            </select>
          </div>
          <div class="mb-3 ms-5">
            <label for="addstatus" class="form-label" style="font-weight: bold;">Estado</label>
            <select id="addstatus" class="swal2-select">
              <option value="" selected disabled>Seleccione una opción</option>
              ${estadoOptions}
            </select>
          </div>
          <div class="mb-3">
             <label for="addcolaborador" class="form-label" style="font-weight: bold;">Colaborador</label>
            <select id="addcolaborador" class="swal2-select">
              <option value="" selected disabled>Seleccione una opción</option>
             ${colaboradorOptions}
            </select>
          </div>
          <div class="mb-3">
            <label for="addstartDate" class="form-label" style="font-weight: bold;">Fecha de Inicio</label>
            <input type="date" id="addstartDate" class="swal2-input">
          </div>
          <div class="mb-3 ms-3">
            <label for="addendDate" class="form-label" style="font-weight: bold;">Fecha de Fin</label>
            <input type="date" id="addendDate" class="swal2-input">
          </div>
        <div class="mb-3">
        
          <label for="addescription" style="font-weight: bold;" class="form-label">Descripción de la tarea</label>
          <textarea class="form-control" id="addescription" rows="2"></textarea>

            <label for="addnotes" style="font-weight: bold;" class="form-label">Notas adicionales</label>
          <textarea class="form-control" id="addnotes" rows="2"></textarea>
        </div>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const descripcion = (document.getElementById('addescription') as HTMLTextAreaElement).value;
        const  notas =  (document.getElementById('addnotes') as HTMLTextAreaElement).value;
        const prioridad = (document.getElementById('addprioridad') as HTMLInputElement).value;
        const colaborador = (document.getElementById('addcolaborador') as HTMLInputElement).value;
        const estado = (document.getElementById('addstatus') as HTMLSelectElement).value;
        const FechaInicio = (document.getElementById('addstartDate') as HTMLInputElement).value;
        const FechaFin = (document.getElementById('addendDate') as HTMLInputElement).value;
    
        if (!descripcion || !estado || !prioridad || !notas || !FechaInicio || !FechaFin) {
          Swal.showValidationMessage(
            '<ul>' +
                '<li>Por favor, complete todos los campos.</li>' +
                '<li>El campo colaborador no es requerido, al iniciar la tarea(PENDIENTE).Pero si lo será si su estado es (EN PROCESO) o (FINALIZADA)</li>' +
            '</ul>'
        );
        }
        
        if(estado!== '2' && !colaborador){
          Swal.showValidationMessage(
            '<ul>' +
                '<li>El campo colaborador es requerido cuando el estado es (EN PROCESO) o (FINALIZADA) </li>' +
            '</ul>'
          );
        }

        const start = new Date(FechaInicio);
        const end = new Date(FechaFin);

        if (start > end) {
          Swal.showValidationMessage('La fecha de inicio no puede ser mayor que la fecha de fin');
          return false;
        }
    
        return { prioridad, estado, colaborador, FechaInicio, FechaFin, descripcion, notas };
      }
    }).then((result:any) => {
      if (result.isConfirmed) {
        
            // Acceder a los valores devueltos
    const prioridad = result.value.prioridad;
    const estado = result.value.estado;
    const colaborador = result.value.colaborador;
    const FechaInicio = result.value.FechaInicio;
    const FechaFin = result.value.FechaFin;
    const descripcion = result.value.descripcion;
    const notas = result.value.notas;

    let formData = new FormData();
    formData.append("descripcion", descripcion);
    formData.append("notas", notas);
    formData.append("prioridad", prioridad);
    formData.append("colaborador", colaborador);
    formData.append("estado", estado);
    formData.append("FechaInicio", FechaInicio);
    formData.append("FechaFin",FechaFin);

    this.tareasService.AddTask(formData).subscribe(
      (response) => {
       
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Tarea agregada exitosamente",
          showConfirmButton: false,
          timer: 1500
        });
        this.ObtenerTareasLista();
      },
      (error) => {
        console.error('Error al agregar la tarea:', error);
      }
    );

       
      }
    });
  }

  Filtrar(){
     ///Obtengo Tareas
 
    const prioridadOptions = this.prioridades.map(p => 
      `<option value="${p.Id_Prioridad}">${p.Prioridad}</option>`
    ).join('');

    const estadoOptions = this.estados.map(e => 
      `<option value="${e.Id_Estado}">${e.Estado}</option>`
    ).join('');

    const colaboradorOptions = this.colaboradores.map(c => 
      `<option value="${c.Id_Colaborador}">${c.Nombre}</option>`
    ).join('');
    Swal.fire({
      title: 'Filtrar Información',
      html: `
        <div class="form-container">
          <div class="mb-3 ms-4">
             <label for="prioridad" class="form-label" style="font-weight: bold;">Prioridad</label>
            <select id="prioridad" class="swal2-select">
              <option value="" selected disabled>Seleccione una opción</option>
              ${prioridadOptions}
            </select>
          </div>
          <div class="mb-3 ms-5">
            <label for="status" class="form-label" style="font-weight: bold;">Estado</label>
            <select id="status" class="swal2-select">
              <option value="" selected disabled>Seleccione una opción</option>
              ${estadoOptions}
            </select>
          </div>
          <div class="mb-3">
             <label for="colaborador" class="form-label" style="font-weight: bold;">Colaborador</label>
            <select id="colaborador" class="swal2-select">
              <option value="" selected disabled>Seleccione una opción</option>
             ${colaboradorOptions}
            </select>
          </div>
          <div class="mb-3">
            <label for="startDate" class="form-label" style="font-weight: bold;">Fecha de Inicio</label>
            <input type="date" id="startDate" class="swal2-input">
          </div>
          <div class="mb-3 ms-3">
            <label for="endDate" class="form-label" style="font-weight: bold;">Fecha de Fin</label>
            <input type="date" id="endDate" class="swal2-input">
          </div>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const prioridad = (document.getElementById('prioridad') as HTMLInputElement).value;
        const colaborador = (document.getElementById('colaborador') as HTMLInputElement).value;
        const estado = (document.getElementById('status') as HTMLSelectElement).value;
        const FechaInicio = (document.getElementById('startDate') as HTMLInputElement).value;
        const FechaFin = (document.getElementById('endDate') as HTMLInputElement).value;
    
      
        if ( !FechaInicio || !FechaFin) {
          Swal.showValidationMessage(
            '<ul>' +
                '<li>Se debe indicar el rango de fechas 👀</li>' +
            '</ul>'
        );
        }

        const start = new Date(FechaInicio);
        const end = new Date(FechaFin);

        if (start > end) {
          Swal.showValidationMessage('La fecha de inicio no puede ser mayor que la fecha de fin');
          return false;
        }
    
        return { prioridad, estado,colaborador,FechaInicio,FechaFin };
      }
    }).then((result:any) => {
      if (result.isConfirmed) {
        
        const params = {
          idTarea: null,
          idColaborador: result.value.colaborador || null,
          idEstado: result.value.estado || null,
          idPrioridad: result.value.prioridad || null,
          fechaInicio: result.value.FechaInicio || null,
          fechaFin: result.value.FechaFin || null
        };
        
        this.ObtenerTareasLista(params);
      }
    });
   
    
  }


  
  
  
}


