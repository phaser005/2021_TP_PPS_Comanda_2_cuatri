import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { DatabaseService } from "./database.service"
import { HttpClient, HttpHeaders } from '@angular/common/http';
import firebase from 'firebase/app'

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	public apiEmail = 'https://nodemailerapidemo.herokuapp.com/email';
	constructor(private auth: AngularFireAuth, private bd: DatabaseService, private http: HttpClient, private zone: NgZone) { }


	loginGoogle() {
		return this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(creds => {
			return this.bd.obtenerPorIdPromise('usuarios', creds.user.uid).then(user => {
				if (user.exists) {
					return creds.user.uid;
				} else {
					let dataJson = {
						foto: creds.user.photoURL,
						nombre: creds.user.displayName,
						correo: creds.user.email,
						estado: false,
						estadoMesa: false,
						perfil: 'Cliente'
					}
					return this.bd.crearConId('usuarios', dataJson, creds.user.uid).then(uid => {
						this.logout();
						return 'creado';
					});
				}
			});
		});
	}
	login(email: string, password: string) {
		return this.auth.signInWithEmailAndPassword(email, password).then(user => user.user.uid);
	}

	registrarUsuario(data) {
		return this.auth.createUserWithEmailAndPassword(data.correo, data.contrasenia).then(userRef => {
			console.log(data.foto.includes('SVG.svg'));
			if (!data.foto.includes('SVG.svg')) {
				let nombreFoto = "usuarios/" + Date.now() + "." + data.dni + ".jpg";
				return this.bd.subirImagen(nombreFoto, data.foto).then(url => {
					data.foto = url;
					return this.bd.crearConId('usuarios', data, userRef.user.uid);
				});
			} else {
				return this.bd.crearConId('usuarios', data, userRef.user.uid);
			}
		}).then(id => {
			this.logout();
			return id;
		});
	}

	registrarUsuarioAnonimo(data) {
		if (!data.foto.includes('SVG.svg')) {
			let nombreFoto = "usuarios/" + Date.now() + "." + data.dni + ".jpg";
			return this.bd.subirImagen(nombreFoto, data.foto).then(url => {
				data.foto = url;
				return this.bd.crear('usuarios', data);
			});
		} else {
			return this.bd.crear('usuarios', data);
		}
	}

	mandarCorreoElectronico(email: string) {
		setTimeout(() => {
			this.auth.sendPasswordResetEmail(email);
		}, 3000);
	}

	logout() {
		return this.auth.signOut();
	}

	mandarEmail(correo: string, subject: string, content: string) {
		let body = {
			destinatario: correo,
			asunto: subject,
			contenido: content
		};
		let headers = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json'
			})
		}
		let subA = this.zone.run(() => this.http.post(this.apiEmail, body, headers).subscribe(sub => {
			console.log(sub);
		}));
		setTimeout(() => {
			subA.unsubscribe();
		}, 5000)
	}


}
