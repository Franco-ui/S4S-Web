import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import {
  Aula,
  Colegio,
  Curso,
  Materia,
  Profesor,
  Turno,
  Modulo,
  // ProfesorReducido,
  // HorarioModulo,
  // MateriaReducido,
} from 'src/app/shared/interface/user.interface';
import { ColegioService } from '../../services/colegio.service';

@Component({
  selector: 'app-materias',
  templateUrl: './materias.component.html',
  styleUrls: ['./materias.component.scss'],
})
export class MateriasComponent implements OnInit {
  objectKeys = Object.keys;
  objectValues = Object.values;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public colegioSvc: ColegioService,
    private afs: AngularFirestore,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.colegioSvc.selectedMateria = new Materia();
  }

  // _______________________________________MATERIAS____________________________________________________________

  openForEditMateria(materia: Materia) {
    this.colegioSvc.selectedMateria = materia;
  }

  addOrEditMateria() {
    if (
      this.colegioSvc.selectedMateria.nombre != '' &&
      this.colegioSvc.selectedMateria.cantidadDeModulosTotal != '' &&
      this.colegioSvc.selectedMateria.curso != '' &&
      this.colegioSvc.selectedMateria.cantidadMaximaDeModulosPorDia != '' &&
      this.colegioSvc.selectedMateria.nombre.length <= 30
    ) {
      if (
        !this.colegioSvc.chequearRepeticionEnSubidaDatos(
          this.colegioSvc.selectedMateria,
          this.colegioSvc.materiaArray
        )
      ) {
        if (this.colegioSvc.selectedMateria.id == 0) {
          if (
            this.colegioSvc.selectedMateria.profesoresCapacitados.length > 0
          ) {
            if (this.colegioSvc.selectedMateria.aulasMateria.length > 0) {
              this.colegioSvc.selectedMateria.id =
                this.colegioSvc.materiaArray.length + 1;
              this.colegioSvc.materiaArray.push(
                this.colegioSvc.selectedMateria
              );
            } else {
              alert('Coloque por lo menos un aula para la materia creada');
            }
          } else {
            alert('Coloque por lo menos un profesor para la materia creada');
          }
        }
        this.colegioSvc.updateDBMateria();
      }
    } else {
      if (this.colegioSvc.selectedMateria.nombre.length > 30) {
        alert('Pone un nombre menor a los 30 caracteres');
      } else {
        alert('Complete los campos vacios');
      }
    }
  }

  clickFormCheckMateriaProfesor(nombre: string) {
    if (
      this.colegioSvc.selectedMateria.profesoresCapacitados.includes(nombre)
    ) {
      this.colegioSvc.selectedMateria.profesoresCapacitados =
        this.colegioSvc.selectedMateria.profesoresCapacitados.filter(
          (profesor) => {
            return profesor != nombre;
          }
        );
    } else {
      this.colegioSvc.selectedMateria.profesoresCapacitados.push(nombre);
    }
  }

  clickFormCheckMateriaAula(nombre: string, tipoAula: Array<Aula> = []) {
    if (tipoAula.length == 0) {
      if (this.colegioSvc.selectedMateria.aulasMateria.includes(nombre)) {
        this.colegioSvc.selectedMateria.aulasMateria =
          this.colegioSvc.selectedMateria.aulasMateria.filter((aula) => {
            return aula != nombre;
          });
      } else {
        this.colegioSvc.selectedMateria.aulasMateria.push(nombre);
      }
    } else {
      if (this.tipoAulaCompleto(tipoAula)) {
        this.colegioSvc.aulaArray.forEach((aula) => {
          if (aula.otro == tipoAula[0].otro) {
            this.colegioSvc.selectedMateria.aulasMateria =
              this.colegioSvc.selectedMateria.aulasMateria.filter((aulaAux) => {
                return aulaAux != aula.nombre;
              });
          }
        });
      } else {
        this.colegioSvc.aulaArray.forEach((aula) => {
          if (aula.otro == tipoAula[0].otro) {
            if (
              !this.colegioSvc.selectedMateria.aulasMateria.includes(
                aula.nombre
              )
            ) {
              this.colegioSvc.selectedMateria.aulasMateria.push(aula.nombre);
            }
          }
        });
      }
    }
  }

  tipoAulaCompleto(tipoAula: Array<Aula>) {
    let aulaCompleto = true;
    tipoAula.forEach((aula) => {
      if (!this.colegioSvc.selectedMateria.aulasMateria.includes(aula.nombre)) {
        aulaCompleto = false;
      }
    });
    return aulaCompleto;
  }
  
  deleteMateria() {
    if (confirm('¿Estas seguro/a que quieres eliminar esta materia?')) {
      this.colegioSvc.materiaArray = this.colegioSvc.materiaArray.filter(
        (x) => x != this.colegioSvc.selectedMateria
      );
      this.colegioSvc.updateDBMateria();
    }
  }

  // async goFormFinalizar() {
  //   this.colegioSvc.botonesCrearColegio = 6;
  //   if (this.colegioSvc.botonesCrearColegio < 6) {
  //     this.colegioSvc.botonesCrearColegio = 6;
  //     this.afs.collection('schools').doc(this.colegioSvc.nombreColegio).update({
  //       botonesCrearColegio: 6,
  //       botonesCrearColegio: 6,
  //     });
  //   }
  // }
}
