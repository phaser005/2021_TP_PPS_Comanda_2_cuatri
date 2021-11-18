import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { DatabaseService } from 'src/app/servicios/database.service';
import { ComplementosService } from 'src/app/servicios/complementos.service';
import { firebaseErrors } from '../../../assets/scripts/errores';
import { FmcService } from 'src/app/servicios/fmc.service';

@Component({
	selector: 'seccion-clientes',
	templateUrl: './seccion-clientes.component.html',
	styleUrls: ['./seccion-clientes.component.scss'],
})
export class SeccionClientesComponent implements OnInit {
	@Input() usuario: any;
	@Input() listaConsultas: Array<any>;
	@Input() listaProductos: Array<any>;
	@Output() flagMenu: EventEmitter<string> = new EventEmitter<string>()
	@Input() set flagFunc(value: string) { this.switchFlagFunc(value); };
	@Input() set numMesa(value:number){ this._numMesa = value};
	public _numMesa: number = -1;
	public selectTipoMesa: Array<string> = ['Por defecto', 'VIP', 'Discapacitados'];
	public lEsperaCantidad: string = null;
	public lEsperaTipo: string = null;
	public consulta: string = null;
	public flagSecc: string = null;
	public propina: string = null;
	public beneficio: string = null;
	public flagJuego: boolean = true;
	public flagEncuesta: boolean = true;
	public mensajeEscanearMesa: boolean = false;
	public deplegarConsultaMozo: boolean = false;
	public verProductos: boolean = false;
	public splash = false;
	public jsonCuenta = {
		id: null,
		pedidos: [],
		propina: this.propina,
		beneficio: this.beneficio,
		precioTotal: 0
	}


	constructor(private bd: DatabaseService, public complemento: ComplementosService, private qr: BarcodeScanner,
		private fmc: FmcService) { }

	ngOnInit() {}

	switchFlagFunc(valor) {
		switch (valor) {
			case "qrMesa":
				this.qrMesa();
				break;
			case "botonMostrarConsulta":
				this.flagSecc = 'Consultas';
				this.verProductos = false;
				break;
			case "confirmarRecepcionPedido":
				this.confirmarRecepcionPedido();
				this.flagSecc = 'Pedidos';
				break;
			case "mostrarEncuestaLista":
				this.flagSecc = 'Encuesta';
				this.verProductos = false;
				break;
			case "mostrarCuentaLista":
				this.mostrarCuentaLista();
				this.verProductos = false;
				break;
			case "mostrarProductos":
				this.flagSecc = '';
				this.verProductos = true;
				break;
			case "mostrarJuegos":
				if (this.flagJuego) {
					this.flagSecc = 'Juegos';
					this.verProductos = false;
				} else {
					this.complemento.presentToastConMensajeYColor('ya perdiste tu oportunidad de obtener un beneficio', 'danger');
				}
				break;
		}
	}

	listaEsperaQRCliente(cantidad, tipo) {
		this.qr.scan().then(data => {
			this.splash = true;
			if (data.text === 'listaEspera') {
				this.bd.obtenerPorIdPromise('usuarios', this.usuario.id).then(snap => {
					const x: any = snap.data() as any;
					if (!x.estadoMesa) {
						let y = {
							idCliente: this.usuario.id,
							nombre: this.usuario.nombre,
							fechaDeEntrada: Date.now(),
							comensales: cantidad,
							tipo: tipo
						}
						return this.bd.crearConId('listaEspera', y, this.usuario.id);
					}
				}).then(data => {
					this.fmc.enviarNotificacion('nuevoListaEspera', 'ha entrado un nuevo cliente a la lista de espera', 'Grupo');
					this.complemento.presentToastConMensajeYColor('Ya se encuentra en la lista de espera. por favor, aguarde a que el metre le asigne una mesa.', 'primary');
				}).catch(err => this.complemento.presentToastConMensajeYColor(firebaseErrors(err), 'danger')).finally(() => {
					this.splash = false;
				});
			} else {
				this.splash = false;
				this.complemento.presentToastConMensajeYColor('qr Equivocado.', 'danger');
			}
		});
	}

	mostrarCuentaLista() {
		this.splash = true;
		this.bd.obtenerTodosCampoValor('pedidos', 'cliente', this.usuario.id).toPromise().then(snaps => {
			let ref = snaps.docs.find(doc => doc.data().estado !== 'Pagado');
			if (ref !== undefined) {
				let x: any = ref.data() as any;
				x['id'] = ref.id;
				x = this.utilizarBeneficio(x);
				this.jsonCuenta.id = x.id;
				this.jsonCuenta.pedidos = x.productos;
				this.jsonCuenta.precioTotal = x.precioTotal;
				this.splash = false;
				this.flagSecc = 'Cuenta';
			}
		});
	}

	qrMesa() {
		let auxPedidos: Array<any> = [];
		this.qr.scan().then(data => {
			this.splash = true;
			return this.bd.obtenerPorIdPromise('mesas', data.text).then(snap => {
				const x: any = snap.data() as any;
				x['id'] = snap.id;
				if (x.id === data.text && x.cliente === this.usuario.id) {
					this.verProductos = true;
					this.flagMenu.emit('ClienteMesaEscaneada');
					return this.bd.obtenerTodosCampoValor('pedidos', 'cliente', this.usuario.id).toPromise().then(datos => {
						auxPedidos = datos.docs.map(doc => {
							const y: any = doc.data() as any; y['id'] = doc.id; return { ...y };
						}).filter(doc => doc.estado !== 'Finalizado');
						return x;
					});
				} else {
					this.complemento.presentToastConMensajeYColor('La mesa ' + x.numero + ' en estado ' + x.estado + ' no le corresponde, vuelva a escanear el qr ', "danger");
				}
			}).then(x => {
				console.log(x);
				let y = auxPedidos[0];
				console.log(y);
				if (y) {
					if (x.id === y.mesa) {
						switch (y.estado) {
							case "Pendiente":
								this.complemento.presentToastConMensajeYColor("Su pedido esta esperando confirmacion de un mozo.", "primary");
								break;
							case "EnPreparacion":
								this.complemento.presentToastConMensajeYColor('Su pedido esta en preparacion, tiempo aprox ' + y.tiempoTotal + ' segundos', "primary");
								break;
							case "Preparado":
								this.complemento.presentToastConMensajeYColor("Su pedido ya esta listo. Enseguida se le llevara a la mesa.", "primary");
								break;
							case "Servido-A":
								this.flagMenu.emit('ClientePedidoServidoA');
								this.complemento.presentToastConMensajeYColor("El mozo a llevado su pedido a la mesa. Confirma la recepcion.", "primary");
								break;
							case "Servido":
								this.flagMenu.emit('ClientePedidoServido');
								this.complemento.presentToastConMensajeYColor("Su pedido esta servido. ya Puede acceder a la encuesta y a la cuenta", "success");
								break;
							case "Pagado":
								this.flagMenu.emit('ClientePedidoPagado');
								this.complemento.presentToastConMensajeYColor("Ya esta todo pagado. en unos momento el Mozo le dara de alta", "primary");
								break;
						}
					} else {
						this.complemento.presentToastConMensajeYColor('La mesa ' + x.numero + ' no es la misma del pedido.', "danger");
					}
				} else {
					this.complemento.presentToastConMensajeYColor('aun no tienes asignado un pedido.', "danger");
				}
			});
		}).catch(err => { console.log(err); this.complemento.presentToastConMensajeYColor(firebaseErrors(err), 'danger') }).finally(() => {
			this.splash = false;
		});
	}

	darPropina() {
		let auxiliar;
		this.qr.scan().then(barcodeData => {
			auxiliar = barcodeData.text;
			switch (auxiliar) {
				case "Excelente":
					this.propina = "Excelente -> 20%";
					this.jsonCuenta.precioTotal = this.jsonCuenta.precioTotal * 1.2;
					break;
				case "Muy bien":
					this.propina = "Muy bien -> 15%";
					this.jsonCuenta.precioTotal = this.jsonCuenta.precioTotal * 1.15;
					break;
				case "Bien":
					this.propina = "Bien -> 10%";
					this.jsonCuenta.precioTotal = this.jsonCuenta.precioTotal * 1.1;
					break;
				case "Regular":
					this.propina = "Regular -> 5%";
					this.jsonCuenta.precioTotal = this.jsonCuenta.precioTotal * 1.05;
					break;
				case "Malo":
					this.propina = "Malo -> 0%";
					break;
			}
		}).catch(err => {
			this.complemento.presentToastConMensajeYColor(firebaseErrors(err), 'danger');
		});
	}

	guardarBeneficio(beneficio) {
		if (beneficio !== null) {
			this.beneficio = beneficio;
		}
		this.flagJuego = false;
		this.flagSecc = '';
		this.verProductos = true;
	}

	guardarEncuesta() {
		this.flagEncuesta = false;
	}

	utilizarBeneficio(pedido: any) {
		if (this.beneficio === 'Descuento 10%') {
			pedido.precioTotal = pedido.precioTotal * 0.90;
		} else if (this.beneficio === 'Postre Gratis') {
			let auxProds: Array<any> = pedido.productos.filter(x => x.tipo === 'Postre');
			let auxIndice = Math.floor(Math.random() * ((auxProds.length - 1) - 0 + 1) + 0);
			let indice = pedido.productos.findIndex(x => x.id === auxProds[auxIndice].id);
			pedido.productos[indice].precio = 0;
			pedido.productos.precioTotal = pedido.productos.reduce((total, prod) => { return total += parseInt(prod.precio) }, 0);
		} else if (this.beneficio === 'Bebida Gratis') {
			let auxProds: Array<any> = pedido.productos.filter(x => x.tipo === 'Bebida');
			let auxIndice = Math.floor(Math.random() * ((auxProds.length - 1) - 0 + 1) + 0);
			let indice = pedido.productos.findIndex(x => x.id === auxProds[auxIndice].id);
			pedido.productos[indice].precio = 0;
			pedido.productos.precioTotal = pedido.productos.reduce((total, prod) => { return total += parseInt(prod.precio) }, 0);
		}
		return pedido;
	}

	confirmarRecepcionPedido() {
		this.splash = true;
		this.bd.obtenerTodosCampoValor('pedidos', 'cliente', this.usuario.id).toPromise().then(snap => {
			const x: any = snap.docs[0].data() as any;
			x.estado = 'Servido';
			return this.bd.actualizar('pedidos', x, snap.docs[0].id);
		}).then(() => {
			this.flagMenu.emit('ClientePedidoServido');
			this.complemento.presentToastConMensajeYColor("Su recepcion del pedido fue registrada", "success");
		}).catch(err => {
			this.complemento.presentToastConMensajeYColor(firebaseErrors(err), 'danger');
		}).finally(() => this.splash = false);
	}

	pagarCuenta() {
		this.splash = true;
		this.bd.obtenerPorIdPromise('pedidos', this.jsonCuenta.id).then(pedidoRef => {
			const x: any = pedidoRef.data() as any;
			x.estado = 'Pagado';
			return this.bd.actualizar('pedidos', x, this.jsonCuenta.id)
		}).catch(err => this.complemento.presentToastConMensajeYColor(firebaseErrors(err), 'danger')).finally(() => {
			this.flagMenu.emit('ClientePedidoPagado');
			this.splash = false;
			this.flagSecc = '';
			this.verProductos = true;
			this.fmc.enviarNotificacion('pedido', `el pedido #${this.jsonCuenta.id} acaba de ser pagado`, 'Grupo');
			this.complemento.presentToastConMensajeYColor("Su pago esta por ser confirmado, gracias por utilizarnos!", "success");
		})
	}

	consultarMozo() {
		this.splash = true;
		this.bd.obtenerPorIdPromise('mesas', this.usuario.estadoMesa).then(mesaRef => {
			let consulta = {
				cliente: this.usuario.nombre,
				mesa: mesaRef.data().numero,
				fecha: Date.now(),
				descripcion: this.consulta,
				estado: false
			}
			return consulta
		}).then(consulta => {
			return this.bd.crear('consultas', consulta)
		}).then(() => {
			this.cancelarConsulta();
			this.fmc.enviarNotificacion('nuevaConsulta', `Un cliente acaba de hacer una consulta`, 'Grupo');
			this.complemento.presentToastConMensajeYColor("Su consulta se realizo con exito,espere a que un mozo se acerce.", "success");
		}).catch(err => this.complemento.presentToastConMensajeYColor(firebaseErrors(err), 'danger')).finally(() => this.splash = false);
	}

	desplegarConsulta() {
		this.deplegarConsultaMozo = true;
	}

	cancelarConsulta() {
		this.consulta = "";
		this.deplegarConsultaMozo = false;
	}

}
