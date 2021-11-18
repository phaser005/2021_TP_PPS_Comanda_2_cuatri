import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { SeccionDueniosComponent } from 'src/app/componentes/seccion-duenios/seccion-duenios.component';
import { SeccionProduccionComponent } from 'src/app/componentes/seccion-produccion/seccion-produccion.component';
import { SeccionMozoComponent } from 'src/app/componentes/seccion-mozo/seccion-mozo.component';
import { SeccionMetreComponent } from 'src/app/componentes/seccion-metre/seccion-metre.component';
import { SeccionClientesComponent } from 'src/app/componentes/seccion-clientes/seccion-clientes.component';
import { SeccionEncuestasComponent } from 'src/app/componentes/seccion-encuestas/seccion-encuestas.component';
import { SeccionJuegosComponent } from 'src/app/componentes/seccion-juegos/seccion-juegos.component';
import { MenuOpcionesComponent } from 'src/app/componentes/menu-opciones/menu-opciones.component';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
		HomePageRoutingModule
	],
	declarations: [
		HomePage,
		SeccionDueniosComponent,
		SeccionProduccionComponent,
		SeccionMozoComponent,
		SeccionMetreComponent,
		SeccionMetreComponent,
		SeccionClientesComponent,
		SeccionEncuestasComponent,
		SeccionJuegosComponent,
		MenuOpcionesComponent,
	]
})
export class HomePageModule { }
