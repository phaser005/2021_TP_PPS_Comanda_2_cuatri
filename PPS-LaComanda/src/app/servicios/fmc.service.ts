import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatabaseService } from 'src/app/servicios/database.service';
import { ComplementosService } from 'src/app/servicios/complementos.service';
import { Observable } from 'rxjs';
import firebase from 'firebase/app';

@Injectable({
	providedIn: 'root'
})
export class FmcService {
	public usuario: any = null;
	public fechasubscripcion: number = -1;
	public firestore = firebase.firestore();
	constructor(private complemento: ComplementosService, private bd: DatabaseService) { }

	enviarNotificacion(topico: string, mensaje: string, destinatario: string) {
		let notificacion = {
			topico: topico,
			mensaje: mensaje,
			destinatario: destinatario,
			fecha: Date.now(),
			leido: [],
		};
		return this.bd.crear('notificaciones', notificacion);
	}

	subscribirseNotificaciones(topico: string) {
		return this.firestore.collection('notificaciones').where('topico', '==', topico).onSnapshot(snap => {
			snap.docChanges().forEach(change => {
				if (change.type === 'added') {
					let x: any = change.doc.data() as any;
					if ((x.destinatario === this.usuario.id || x.destinatario === 'Grupo') && x.fecha >= this.fechasubscripcion)
						if (x.leido.findIndex(y => y === this.usuario.id) === -1) {
							x.leido.push(this.usuario.id);
							setTimeout(() => {
								this.complemento.presentToastConMensajeYColor(x.mensaje, 'primary');
								this.bd.actualizar('notificaciones', x, change.doc.id);
							}, 2000);
						}
				}
			});
		});
	}

	gestionReserva(reserva): Observable<boolean> {
		return Observable.create(observer => {
			setInterval(() => {
				if (Date.now() >= (reserva.fecha - 40 * 60 * 1000)) {
					this.bd.obtenerTodosCampoValor('mesas', 'numero', reserva.mesa).toPromise().then(ref => {
						let x: any = ref.docs[0].data() as any;
						x.cliente = this.usuario.id;
						x.estado = 'Ocupado';
						return this.bd.actualizar('mesas', x, ref.docs[0].id).then(() => {
							return ref.docs[0].id;
						});
					}).then(uidMesa => {
						return this.bd.obtenerPorIdPromise('usuarios', this.usuario.id).then(ref => {
							let x: any = ref.data() as any;
							x.estadoMesa = uidMesa;
							return this.bd.actualizar('usuarios', x, this.usuario.id);
						})
					}).then(uidMesa => {
						return this.bd.eliminar('reservas', reserva.id);
					}).then(() => {
						observer.next(true);
					})
				} else {
					observer.next(false);
				}
			}, 60000);
		});
	}

}
