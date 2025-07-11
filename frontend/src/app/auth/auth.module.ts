import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {LoginComponent} from './login.component';
import {RegisterComponent} from './register.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoginComponent, RegisterComponent],
  declarations: [],
  exports: [LoginComponent, RegisterComponent]
})
export class AuthModule {
}
