import { Component, OnInit, Input } from '@angular/core';
import { DatabaseService } from 'src/app/servicios/database.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { firebaseErrors } from '../../../assets/scripts/errores';
import { FmcService } from 'src/app/servicios/fmc.service';

@Component({
	selector: 'seccion-duenios',
	templateUrl: './seccion-duenios.component.html',
	styleUrls: ['./seccion-duenios.component.scss'],
})
export class SeccionDueniosComponent implements OnInit {
	@Input() listaUsuarios: Array<any>;
	@Input() listaReservas: Array<any>;
	public _flagFunc: string = "mostrarClientesNuevos";
	@Input() set flagFunc(value:string){ this.switchFlagFunc(value); }
	constructor(private bd: DatabaseService, private auth: AuthService, private fmc: FmcService) { }

	ngOnInit() { }

	switchFlagFunc(value){
		switch (value) {
			case "mostrarClientesNuevos":
			case "mostrarReservasNuevas":
				this._flagFunc = value;
				break;
		}
	}

	organizarUsuario(usuario, estado) {
		let asuntoCorreo: string = 'Habilitacion de cuenta para la comanda'
		let mensajeCorreo: string = '';
		this.bd.obtenerPorIdPromise('usuarios', usuario.id).then(user => {
			const x: any = user.data() as any;
			if (estado == null) {
				x.estado = estado;
				this.bd.actualizar('usuarios', x, usuario.id);
				mensajeCorreo = '<i>Tu registro ha sido rechazado. no podrias loguearte con esta cuenta</i>'
			} else {
				x.estado = estado;
				this.bd.actualizar('usuarios', x, usuario.id);
				mensajeCorreo = '<i>Tu registro ha sido aceptado. ya puedes loguearte con esta cuenta</i>'
			}
			this.auth.mandarEmail(usuario.correo, asuntoCorreo, mensajeCorreo);
		});
	}

	organizarReserva(reserva, estado) {
		this.bd.obtenerPorIdPromise('reservas', reserva.id).then(user => {
			const x: any = user.data() as any;
			if (estado == null) {
				x.estado = estado;
				this.bd.actualizar('reservas', x, reserva.id);
				this.fmc.enviarNotificacion('avisoReserva', 'su reserva se ha rechazado', reserva.cliente);
			} else {
				x.estado = estado;
				this.bd.actualizar('reservas', x, reserva.id);
				this.fmc.enviarNotificacion('avisoReserva', 'su reserva se ha aprobado', reserva.cliente);
			}
		});
	}

}
