import { Component, OnInit } from '@angular/core';
import { emailVerified } from '@angular/fire/auth-guard';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [AuthService],
})
export class HomeComponent implements OnInit {
  constructor(private router: Router, private authSvc: AuthService) {}

  ngOnInit(): void {}

  gotoLogin() {
    if (this.authSvc.userData) {
      this.router.navigate(['/menu-principal']);
    }else{
      this.router.navigate(['/login']);
    }
    //revisar
    // else if (this.aServ.userData.emailVerified) {
    //   this.router.navigate(['/verificacion-email']);
    // }

    /*else if(user ya eligio){
        if(){}
        else{}
      this.router.navigate(['/paginaPrincipal']);
    } */
  }

  // get isLoggedIn(): boolean {
  //   const user = this.aServ.userData;
  //   if(user === null || user === undefined) return false
  //   return user.emailVerified;
  // }

  functionScrollToDownMoreInfo() {
    window.scrollTo({
      top: 1400,
      left: 0,
      behavior: 'smooth',
    });
  }

  functionScrollToDown() {
    //window.scrollTo(0,0);

    window.scrollTo({
      top: 623,
      left: 0,
      behavior: 'smooth',
    });

    //$("button","#buttonScrollToDown").animate({scrollTop: 50},"slow");
  }

  functionScrollToUp() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }
}
