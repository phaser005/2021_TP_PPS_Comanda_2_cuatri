import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/servicios/auth.service';
import { Router } from "@angular/router";
import { ComplementosService } from 'src/app/servicios/complementos.service';


@Component({
	selector: 'menu-opciones',
	templateUrl: './menu-opciones.component.html',
	styleUrls: ['./menu-opciones.component.scss'],
})
export class MenuOpcionesComponent implements OnInit {
	@Output() flagFunc: EventEmitter<string> = new EventEmitter<string>();
	@Input() usuario: any;
	@Input() set flagMenu(value: string) { this.switchFlagMenu(value); };
	public nivelFlagMenu: number =-1;

	constructor(private auth: AuthService, private menu: MenuController, private router: Router) { }

	ngOnInit() { }

	switchFlagMenu(valor) {
		console.log(valor);
		switch (valor) {
			case null:
				this.nivelFlagMenu = 0;
				break;
			case "ClienteMesaAsignada":
				this.nivelFlagMenu = 1;
				break;
			case "ClienteMesaEscaneada":
				this.nivelFlagMenu = 2;
				break;
			case "ClientePedidoServidoA":
				this.nivelFlagMenu = 3;
				break;
			default:
			case "ClientePedidoServido":
				this.nivelFlagMenu = 4;
				break;
			case "ClientePedidoPagado":
				this.nivelFlagMenu = 5;
				break;
		}
	}

	solicitarFunc(funcion) {
		this.flagFunc.emit(funcion);
	}
}
