import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatabaseService } from 'src/app/servicios/database.service';
import { ComplementosService } from 'src/app/servicios/complementos.service';
import { firebaseErrors } from '../../../assets/scripts/errores';
import { FmcService } from 'src/app/servicios/fmc.service';

@Component({
	selector: 'seccion-mozo',
	templateUrl: './seccion-mozo.component.html',
	styleUrls: ['./seccion-mozo.component.scss'],
})
export class SeccionMozoComponent implements OnInit {
	@Input() usuario: any;
	@Input() listaConsultas: Array<any>;
	@Input() listaPedidos: Array<any>;
	@Input() set flagFunc(value: string) { this.switchFlagFunc(value); };
	public splash = false;
	public respuestaConsulta: string = null;
	public flagSecc: string = null;
	public estadoPedido: string = null;

	constructor(private bd: DatabaseService, public complemento: ComplementosService, private fmc: FmcService) { }

	ngOnInit() { }

	switchFlagFunc(valor) {
		console.log(this.listaPedidos)
		console.log(valor);
		switch (valor) {
			case "mostrarConsultas":
				this.flagSecc = 'Consultas';
				break;
			case "mostrarPedidosPendientes":
				this.flagSecc = 'Pedidos';
				this.estadoPedido = 'Pendiente';
				break;
			case "mostrarPedidosPreparados":
				this.flagSecc = 'Pedidos';
				this.estadoPedido = 'Preparado';
				break;
			case "mostrarPedidosPagados":
				this.flagSecc = 'Pedidos';
				this.estadoPedido = 'Pagado';
				break;
		}
	}

	consultaConExito(consulta) {
		this.splash = true;
		consulta.estado = true;
		consulta['respuesta'] = this.respuestaConsulta;
		this.bd.actualizar('consultas', consulta, consulta.id).then(() => {
			this.complemento.presentToastConMensajeYColor('La consulta fue resuelta con exito!', 'success');
		}).catch(err => {
			this.complemento.presentToastConMensajeYColor(firebaseErrors(err), 'danger');
		}).finally(() => this.splash = false);
	}

	liberarMesa(pedido) {
		this.splash = true;
		this.bd.obtenerPorIdPromise('mesas', pedido.mesa).then(refMesa => {
			const x: any = refMesa.data() as any;
			x.estado = 'Libre',
				x.cliente = null
			return this.bd.actualizar('mesas', x, pedido.mesa);
		}).then(() => {
			return this.bd.obtenerPorIdPromise('usuarios', pedido.cliente).then(userRef => {
				const x: any = userRef.data() as any;
				x.estadoMesa = false;
				return this.bd.actualizar('usuarios', x, pedido.cliente).then(() => {
					this.complemento.presentToastConMensajeYColor("La mesa a sido liberada", "success");
				});
			});
		}).then(() => {
			return this.modificarEstadoPedido(pedido, 'Finalizado');
		}).catch(err => {
			this.complemento.presentToastConMensajeYColor(firebaseErrors(err), 'danger');
		}).finally(() => this.splash = false);
	}

	modificarEstadoPedido(pedido, estado) {
		if (pedido.estado !== 'Finalizado') {
			this.splash = true;
			pedido.estado = estado;
			this.bd.actualizar('pedidos', pedido, pedido.id).then(() => {
				this.complemento.presentToastConMensajeYColor('Estado de pedido modificado.', 'success')
			}).catch(err => {
				this.complemento.presentToastConMensajeYColor(firebaseErrors(err), 'danger');
			}).finally(() => {
				if (estado === 'EnPreparacion') {
					this.fmc.enviarNotificacion('pedidoaPreparar', 'Hay un nuevo pedido para preparar', 'Grupo');
				}
				this.splash = false
				this.cancelarConsulta();
			});
		}
	}

	cancelarConsulta() {
		this.respuestaConsulta = null;
		this.flagSecc = null;
	}

}
