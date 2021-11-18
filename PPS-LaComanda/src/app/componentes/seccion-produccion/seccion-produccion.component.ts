import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { firebaseErrors } from 'src/assets/scripts/errores';
import { DatabaseService } from 'src/app/servicios/database.service';
import { ComplementosService } from 'src/app/servicios/complementos.service';
import { FmcService } from 'src/app/servicios/fmc.service';

@Component({
	selector: 'seccion-produccion',
	templateUrl: './seccion-produccion.component.html',
	styleUrls: ['./seccion-produccion.component.scss'],
})
export class SeccionProduccionComponent implements OnInit {
	@Input() usuario: any;
	@Input() listaPedidos: Array<any>;
	public splash = false;
	constructor(private bd: DatabaseService, private complemento: ComplementosService, private fmc: FmcService) { }

	ngOnInit() { }

	elaborarPedido(pedido: any) {
		console.log(pedido);
		this.splash = true;
		pedido.productos.forEach(p => {
			if (this.usuario.perfil === 'Cocinero' && (p.tipo === 'Plato' || p.tipo === 'Postre')) {
				p.estado = true;
			} else if (this.usuario.perfil === 'BarTender' && p.tipo === 'Bebida') {
				p.estado = true;
			}
		})
		console.log(pedido.productos);
		if (pedido.productos.every(p => p.estado === true)) {
			pedido.estado = 'Preparado';
			return this.bd.actualizar('pedidos', pedido, pedido.id).then(() => {
				this.fmc.enviarNotificacion('pedido',`el pedido #${pedido.id} ya esta listo para ser servido.`,'Grupo')
				this.complemento.presentToastConMensajeYColor("Todos los Productos del pedido preparados", "success");
			}).catch(err => {
				this.complemento.presentToastConMensajeYColor(firebaseErrors(err), 'danger');
			}).finally(() => {
				this.splash = false;
			});
		} else {
			this.bd.actualizar('pedidos', pedido, pedido.id).then(() => {
				this.complemento.presentToastConMensajeYColor("Productos de sector preparados", "success");
			}).catch(err => {
				this.complemento.presentToastConMensajeYColor(firebaseErrors(err), 'danger');
			}).finally(() => {
				this.splash = false;
			});
		}
	}

}
