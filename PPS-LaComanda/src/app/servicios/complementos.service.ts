import { Injectable } from '@angular/core';
import { Vibration } from '@ionic-native/vibration/ngx';
import { ToastController, LoadingController } from '@ionic/angular';
import { timer } from 'rxjs';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
})
export class ComplementosService {
	public flagSonidos: boolean = true;
	public splash: boolean = false;

	constructor(public toastController: ToastController, public loadingController: LoadingController, public vib: Vibration) { }

	playAudio(tipoAudio) {
		if (this.flagSonidos) {
			if (this.flagSonidos) {
				let audio = new Audio();
				if (tipoAudio === 'success') {
					audio.src = '../../assets/audio/login/sonidoBotonSUCESS.mp3';
				} else if (tipoAudio === 'error') {
					audio.src = '../../assets/audio/login/sonidoBotonBORRAR.mp3';
				} else if (tipoAudio === 'notification') {
					audio.src = '../../assets/audio/login/sonidoBotonNOTIFICATION.mp3';
				}
				audio.play();
			}
		}
	}

	toggleSonidos() {
		this.flagSonidos = !this.flagSonidos;
	}

	// Muestro el toast, mensaje de error. 
	async presentToast(msg) {
		console.log(msg);
		const toast = await this.toastController.create({
			message: msg,
			position: 'bottom',
			duration: 2000,
			color: 'danger',
			buttons: [
				{
					text: 'Aceptar',
					role: 'cancel',
				}
			]
		});
		toast.present();
	}

	// Valido absolutamente todos los posibles errores. 
	ngValidarError(err) {
		console.log(err);
		switch (err) {
			case 'auth/argument-error':
				err = 'ERROR: Debe completar todos los campos';
				break;
			case 'auth/invalid-email':
				err = 'ERROR: Formato de email no correcto';
				break;
			case 'auth/user-not-found':
				err = 'ERROR: Usuario no valido';
				break;
			case 'auth/wrong-password':
				err = 'ERROR: Contraseña incorrecta';
				break;
			default:
				err = 'ERROR';
				break;
		}
		this.presentToast(err);
	}



	// Muestro el toast, mensaje de error. 
	async presentToastConMensajeYColor(msg: string, color: string) {
		console.log(msg);
		if (color === 'danger') {
			this.playAudio('error');
			this.vib.vibrate(1000);
		} else if ('success') {
			this.playAudio('success');
		} else {
			this.playAudio('notification');
		}
		const toast = await this.toastController.create({
			message: msg,
			position: 'bottom',
			duration: 3000,
			color: color,
			buttons: [
				{
					text: 'Aceptar',
					role: 'cancel',
				}
			]
		});
		toast.present();
	}
}
