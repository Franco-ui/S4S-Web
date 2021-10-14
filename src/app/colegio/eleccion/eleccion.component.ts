import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Colegio } from 'src/app/shared/interface/user.interface';
import { ColegioService } from '../services/colegio.service';

@Component({
  selector: 'app-eleccion',
  templateUrl: './eleccion.component.html',
  styleUrls: ['./eleccion.component.scss'],
  providers: [AuthService],
})
export class EleccionComponent implements OnInit {
  nombreColegio: string;
  fueACrear: boolean = false;
  fueAUnirse: boolean = false;
  provinciasArgentina: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authSvc: AuthService,
    private afs: AngularFirestore,
    private http: HttpClient
  ) {
    authSvc.afAuth.authState.subscribe((user) => {
      this.http
        .get('https://apis.datos.gob.ar/georef/api/provincias', {
          responseType: 'json',
        })
        .subscribe((data) => {
          this.provinciasArgentina = data;
          this.provinciasArgentina = this.provinciasArgentina['provincias'];
        });
    });
  }

  crearColegioForm: FormGroup;
  unirseColegioForm: FormGroup;

  ngOnInit(): void {
    this.crearColegioForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      provincia: ['', Validators.required],
      telefono: ['', Validators.required],
      duracionModulo: ['', Validators.required],
      inicioHorario: ['', Validators.required],
      finalizacionHorario: ['', Validators.required],
    });

    this.unirseColegioForm = this.fb.group({
      nombreColegio: ['', Validators.required],
      idColegio: ['', Validators.required],
    });
  }

  async generaNss() {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < characters.length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  id = this.generaNss();

  //joya
  async onCrear() {
    const {
      nombre,
      direccion,
      provincia,
      telefono,
      duracionModulo,
      inicioHorario,
      finalizacionHorario,
    } = this.crearColegioForm.value;
    const school = await this.authSvc.createSchool(
      nombre,
      direccion,
      provincia,
      telefono,
      duracionModulo,
      inicioHorario,
      finalizacionHorario,
      await this.id
    );
  }

  async onUnirse() {
    const { nombreColegio, idColegio } = await this.unirseColegioForm.value;

    if (nombreColegio) {
      this.afs.firestore
        .collection('schools')
        .where('nombre', '==', nombreColegio)
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.size > 0) {
            querySnapshot.forEach((doc) => {
              if (
                doc.data().id == idColegio &&
                this.authSvc.userData.uid != doc.data().userAdmin
              ) {
                this.afs.firestore
                  .collection('schools')
                  .where('nombre', '==', nombreColegio)
                  .get()
                  .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      let usuariosExtensionesArray =
                        doc.data().usuariosExtensiones;
                      usuariosExtensionesArray.push(this.authSvc.userData.uid);
                      this.afs.collection('schools').doc(nombreColegio).update({
                        usuariosExtensiones: usuariosExtensionesArray,
                      });
                      this.router.navigate([
                        '/' + nombreColegio + '/crear-colegio',
                      ]);
                    });
                  });
              } else {
                alert('No puedes unirte a un colegio que creaste.');
              }
            });
          } else {
            alert(
              'El colegio ' +
                nombreColegio +
                ' no existe, por favor ingrese otro nombre.'
            );
          }
        });
    }

    // if (nombreColegio) {
    //   this.afs.firestore
    //     .collection('schools')
    //     .doc(nombreColegio)
    //     .get()
    //     .then((querySnapshot) => {
    //       if (querySnapshot.data()) {
    //         if (
    //           querySnapshot.data()?.id == idColegio &&
    //           this.authSvc.userData.uid != querySnapshot.data()?.userAdmin
    //         ) {
    //           this.colegioSvc.usuariosExtensionesArray.push(
    //             this.authSvc.userData.uid
    //           );
    //           this.afs.collection('schools').doc(nombreColegio).update({
    //             usuariosExtensiones: this.colegioSvc.usuariosExtensionesArray,
    //           });
    //           this.router.navigate(['/' + nombreColegio + '/crear-colegio']);
    //         }
    //       } else {
    //         alert(
    //           'El colegio ' +
    //             nombreColegio +
    //             ' no existe, por favor ingrese otro nombre'
    //         );
    //       }
    //     });
    // }
  }

  //joya
  irCrear() {
    this.fueACrear = true;
    this.fueAUnirse = false;
  }

  //joya
  irUnirse() {
    this.fueAUnirse = true;
    this.fueACrear = false;
  }
}
