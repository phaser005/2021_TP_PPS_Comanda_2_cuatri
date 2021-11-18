import { Component, OnInit } from '@angular/core';
import { ComplementosService } from 'src/app/servicios/complementos.service';
import { DatabaseService } from 'src/app/servicios/database.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { firebaseErrors } from 'src/assets/scripts/errores';
import { FmcService } from 'src/app/servicios/fmc.service';


@Component({
	selector: 'app-reservas',
	templateUrl: './reservas.page.html',
	styleUrls: ['./reservas.page.scss'],
})
export class ReservasPage implements OnInit {
	public usuario: any = null;
	public splash: boolean = false;
	public listaReservas: Array<any> = [];
	public miFormulario: FormGroup = this.formBuilder.group({
		fecha: [null, Validators.required],
		tipoMesa: [null, Validators.required],
		comensales: [null, [Validators.required, Validators.min(1), Validators.max(99)]]
	});
	public fechaValorActual: string;
	public fechaValorMinimo: string;
	public fechaValorMaximo: string;
	public flagNumMesa: any = null;
	constructor(private router: Router, private bd: DatabaseService, private formBuilder: FormBuilder,
		private fmc: FmcService, private complemetos: ComplementosService) { }

	validation_messages = {
		'fecha': [
			{ type: 'required', message: 'La fecha es requerida.' },
		],
		'tipoMesa': [
			{ type: 'required', message: 'El tipo de mesa es requerido.' },
		],
		'comensales': [
			{ type: 'required', message: 'La cantidad de comensales es requerida.' },
			{ type: 'min', message: 'El numero de comensales debe ser mayor a 0.' },
			{ type: 'max', message: 'El numero de comensales debe ser menor a 100.' },
		]
	};

	ngOnInit() {
		let d = new Date();
		this.fechaValorMinimo = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString();
		this.fechaValorMaximo = new Date((d.getTime() - (d.getTimezoneOffset() * 60000)) + (1 * 365 * 24 * 60 * 60 * 1000)).toISOString();
		this.bd.obtenerTodosTiempoReal('reservas').onSnapshot(snaps => {
			this.listaReservas = snaps.docs.map(doc => {
				const x: any = doc.data() as any;
				return { ...x };
			});
		});
	}

	Ifecha($event) {
		let fecha = new Date($event.detail.value);
		this.fechaValorActual = fecha.toISOString();
		this.miFormulario.controls.fecha.setValue(fecha.getTime());
	}

	ITipo($event) {
		this.miFormulario.controls.tipoMesa.setValue($event.detail.value);
	}

	cargarReserva() {
		this.splash = true;
		let auxMesas: Array<any> = [];
		let fechaAntes: number = this.miFormulario.value.fecha - (40 * 60 * 1000);
		let fechaDespues: number = this.miFormulario.value.fecha + (40 * 60 * 1000);
		if (this.miFormulario.valid) {
			if (this.miFormulario.value.fecha > (Date.now() + (40 * 60 * 1000))) {
				if (this.listaReservas.length == 0) {
					this.bd.obtenerTodosPromise('mesas').then(snaps => {
						auxMesas = snaps.docs.map(x => {
							const y: any = x.data() as any; y['id'] = x.id; return { ...y };
						}).filter(x => x.comensales === this.miFormulario.value.comensales && x.tipo === this.miFormulario.value.tipoMesa);
						if (auxMesas.length > 0) {
							this.flagNumMesa = auxMesas[0].numero;
							return this.crearReserva(this.flagNumMesa, this.miFormulario.value.fecha);
						} else {
							this.complemetos.presentToastConMensajeYColor('No se han encontrado mesas que cumplan con los requisitos solicitados.', 'danger');
						}
					}).then(ref => {
						this.fmc.enviarNotificacion('nuevaReserva', 'Hay una nueva reserva para confirmar', 'Grupo');
						this.complemetos.presentToastConMensajeYColor('Reserva cargada con exito. el dueño o supervisor revisara su peticion.', 'success')
					}).finally(() => this.splash = false);
				} else {
					if (this.listaReservas.findIndex(x => x.cliente === localStorage.getItem('uidUsuario') && (x.fecha >= fechaAntes && x.fecha <= fechaDespues)) === -1) {
						this.bd.obtenerTodosPromise('mesas').then(snaps => {
							auxMesas = snaps.docs.map(x => {
								const y: any = x.data() as any; y['id'] = x.id; return { ...y };
							}).filter(x => x.comensales === this.miFormulario.value.comensales && x.tipo === this.miFormulario.value.tipoMesa);
							if (auxMesas.length > 0) {
								auxMesas.forEach(x => {
									if (this.listaReservas.findIndex(y => y.mesa === x.numero && (x.fecha >= fechaAntes && x.fecha <= fechaDespues)) === -1) {
										this.flagNumMesa = x.numero;
									}
								});
								if (this.flagNumMesa !== null) {
									return this.crearReserva(this.flagNumMesa, this.miFormulario.value.fecha);
								} else {
									this.complemetos.presentToastConMensajeYColor('Todas las mesas que cumplen con los requisitos ya estan reservadas para este horario (' + new Date(fechaAntes).toLocaleString() + ' - ' + new Date(fechaDespues).toLocaleString() + ').', 'danger');
								}
							} else {
								this.complemetos.presentToastConMensajeYColor('No se han encontrado mesas que cumplan con los requisitos solicitados.', 'danger');
							}
						}).then(ref => {
							this.fmc.enviarNotificacion('nuevaReserva', 'Hay una nueva reserva para confirmar', 'Grupo');
							this.complemetos.presentToastConMensajeYColor('Reserva cargada con exito. el dueño o supervisor revisara su peticion.', 'success')
						}).finally(() => this.splash = false);
					} else {
						this.splash = false;
						this.complemetos.presentToastConMensajeYColor('Ya tienes una reservacion echa para este horario (' + new Date(fechaAntes).toLocaleString() + ' - ' + new Date(fechaDespues).toLocaleString() + ').', 'danger');
					}
				}
			} else {
				this.splash = false;
				this.complemetos.presentToastConMensajeYColor('se ha asignado una fecha invalida. la reserva se debe cargar 40 minutos antes de ser efectiva.', 'danger');
			}
		}
	}

	crearReserva(mesa, fecha) {
		let reservaJson = {
			fecha: fecha,
			cliente: localStorage.getItem('uidUsuario'),
			mesa: mesa,
			estado: false,
		}
		console.log(reservaJson);
		return this.bd.crear('reservas', reservaJson);
	}

}
