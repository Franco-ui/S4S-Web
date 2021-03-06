import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ColegioService } from '../services/colegio.service';

@Component({
  selector: 'app-crear-colegio',
  templateUrl: './crear-colegio.component.html',
  styleUrls: ['./crear-colegio.component.scss'],
  providers: [AuthService],
})
export class CrearColegioComponent implements OnInit {
  constructor(
    public colegioSvc: ColegioService,
    private activatedRoute: ActivatedRoute,
    private afs: AngularFirestore,
    private router: Router,
    private authSvc: AuthService
  ) {
    activatedRoute.params.subscribe((params) => {
      this.colegioSvc.nombreColegio = params.nombreColegio;
      this.colegioSvc.seccion = params.seccion;
    });
  }

  ngOnInit(): void {
    // this.activatedRoute.queryParams.subscribe(async (params) => {
    //   if (params['status'] == 'approved') {
    //     this.colegioSvc.seccion = 'finalizar';
    //     this.colegioSvc.pagoFinalizado = true;
    //   } else if (params['status'] == 'disapproved') {
    //     alert('Error de Pago: GbFH6dhd84HSKfaWJWN7772yk7JGOD');
    //     this.colegioSvc.seccion = 'turnos';
    //   }
    // });
  }

  setMyStyles(color: string) {
    let styles = {
      background: color,
    };
    return styles;
  }

  clickeoBotones(seccion: string) {
    this.router.navigate([
      this.colegioSvc.nombreColegio,
      'crear-colegio',
      seccion,
    ]);
    this.colegioSvc.seccion = seccion;
  }
}
