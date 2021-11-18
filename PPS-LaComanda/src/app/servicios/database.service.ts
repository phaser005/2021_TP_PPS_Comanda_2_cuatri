import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";
import firebase from 'firebase/app';

@Injectable({
	providedIn: 'root'
})
export class DatabaseService {
	public firestoreA = firebase.firestore();

	constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) { }

	public crear(collection: string, data: any) {
		return this.firestore.collection(collection).add(data).then(ref => ref.id);
	}

	public crearConId(collection: string, data: any, id: string) {
		return this.firestore.collection(collection).doc(id).set(data).then(() => { return id });
	}

	public actualizar(coleccion: string, data: any, id: string) {
		return this.firestore.collection(coleccion).doc(id).set(data, { merge: true });
	}

	public actualizarPedido(coleccion: string, doc: string, campos: Array<any>) {
		let dataUpdt = {};
		campos.forEach(c => {
			dataUpdt[c.campo] = c.valor;
		})
		return this.firestore.collection(coleccion).doc(doc).update(dataUpdt);
	}

	public eliminar(coleccion: string, id: string) {
		return this.firestore.collection(coleccion).doc(id).delete();
	}

	public obtenerPorId(coleccion: string, id: string) {
		return this.firestoreA.collection(coleccion).doc(id);
	}

	public obtenerTodos(coleccion: string) {
		return this.firestore.collection(coleccion).snapshotChanges();
	}

	public obtenerTodosTiempoReal(coleccion: string) {
		return this.firestoreA.collection(coleccion);
	}

	public obtenerTodosPromise(coleccion: string) {
		return this.firestore.collection(coleccion).get().toPromise();
	}

	public obtenerPorIdPromise(coleccion: string, id: string) {
		return this.firestore.collection(coleccion).doc(id).get().toPromise();
	}

	public obtenerTodosCampoValor(coleccion: string, campo: string, valor: string) {
		return this.firestore.collection(coleccion, ref => ref.where(campo, "==", valor)).get();
	}

	public subirImagen(ruta: string, data: any) {
		return this.storage.ref(ruta).putString(data, 'data_url').then(data => {
			return data.ref.getDownloadURL().then(x => x);
		});
	}
}
