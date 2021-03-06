import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ServiceSpinnerService } from 'src/app/shared/loading-spinner/service-spinner.service';

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
  localidadesProvincia: Array<any> = [];
  colegiosBuscados: Array<string> = [];
  seleccionoColegio: boolean = false;
  colegioElegido: string = ' ';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authSvc: AuthService,
    private afs: AngularFirestore,
    private http: HttpClient,
    private spinnerSvc: ServiceSpinnerService
  ) {
    authSvc.afAuth.authState.subscribe(() => {
      this.http
        .get('https://apis.datos.gob.ar/georef/api/provincias', {
          responseType: 'json',
        })
        .subscribe((data) => {
          let provinciasArgentina: any = data;
          this.provinciasArgentina = provinciasArgentina['provincias'].sort(
            (a: any, b: any) => a.nombre.localeCompare(b.nombre)
          );
        });
    });
  }

  crearColegioForm: FormGroup;
  unirseColegioForm: FormGroup;

  ngOnInit(): void {
    this.crearColegioForm = this.fb.group({
      nombre: ['', Validators.required],
      color: ['', Validators.required],
      provincia: ['', Validators.required],
      localidad: ['', Validators.required],
      telefono: ['', Validators.required],
      // duracionModulo: ['', Validators.required],
      // inicioHorario: ['', Validators.required],
      // finalizacionHorario: ['', Validators.required],
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
      color,
      provincia,
      localidad,
      telefono,
      // duracionModulo,
      // inicioHorario,
      // finalizacionHorario,
    } = this.crearColegioForm.value;
    const school = await this.authSvc.createSchool(
      nombre,
      color,
      provincia,
      localidad,
      telefono,
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
              if (doc.data().id == idColegio) {
                this.afs.firestore
                  .collection('schools')
                  .where('nombre', '==', nombreColegio)
                  .get()
                  .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      if (
                        !doc
                          .data()
                          .usuariosExtensiones.includes(
                            this.authSvc.userData.uid
                          ) &&
                        this.authSvc.userData.uid != doc.data().userAdmin
                      ) {
                        let usuariosExtensionesArray =
                          doc.data().usuariosExtensiones;
                        usuariosExtensionesArray.push(
                          this.authSvc.userData.uid
                        );
                        this.afs
                          .collection('schools')
                          .doc(nombreColegio)
                          .update({
                            usuariosExtensiones: usuariosExtensionesArray,
                          });
                        // this.router.navigate([
                        //   nombreColegio,
                        //   'crear-colegio',
                        //   'turnos',
                        // ]);

                        this.router.navigate(['menu-principal']);
                      } else {
                        alert('Ya perteneces a ' + nombreColegio + '.');
                      }
                    });
                  });
              } else {
                alert('El codigo es incorrecto');
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

  localidadesPorProvincia(provincia: string) {
    this.http
      .get(
        'https://apis.datos.gob.ar/georef/api/localidades?campos=nombre&max=5000&provincia=' +
          provincia,
        {
          responseType: 'json',
        }
      )
      .subscribe((data: any) => {
        this.localidadesProvincia = data['localidades'].sort((a: any, b: any) =>
          a.nombre.localeCompare(b.nombre)
        );
      });
  }

  buscarColegios() {
    this.seleccionoColegio = false;
    this.afs.firestore
      .collection('schools')
      .get()
      .then((querySnapshot) => {
        this.colegiosBuscados = [];
        if (querySnapshot.size > 0) {
          querySnapshot.forEach((school) => {
            if (
              school
                .data()
                ['nombre'].toLowerCase()
                .includes(
                  this.unirseColegioForm.value['nombreColegio'].toLowerCase()
                )
            ) {
              this.colegiosBuscados.push(school.data()['nombre']);
            }
          });
        }
      });
  }

  seleccionaColegio(colegio: string) {
    this.unirseColegioForm = this.fb.group({
      nombreColegio: [colegio, Validators.required],
      idColegio: ['', Validators.required],
    });
    this.colegioElegido = colegio;
    this.seleccionoColegio = true;
  }
}
