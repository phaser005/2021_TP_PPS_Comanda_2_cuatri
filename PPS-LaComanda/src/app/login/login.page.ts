import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { ComplementosService } from 'src/app/servicios/complementos.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { DatabaseService } from 'src/app/servicios/database.service';
import { firebaseErrors } from 'src/assets/scripts/errores';

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
	email: string;
	password: string;
	pickedName = null;
	splash: boolean = false;
	listaUsuarios = [
		{ id: 1, correo: "duenio@duenio.com", clave: "111111", perfil: "Dueño" },
		{ id: 2, correo: "supervisor@supervisor.com", clave: "222222", perfil: "Supervisor" },
		{ id: 3, correo: "mozo@mozo.com", clave: "333333", perfil: "Mozo" },
		{ id: 4, correo: "cocinero@cocinero.com", clave: "444444", perfil: "Cocinero" },
		{ id: 5, correo: "metre@metre.com", clave: "555555", perfil: "Metre" },
		{ id: 6, correo: "bartender@bartender.com", clave: "666666", perfil: "BarTender" }
	]

	constructor(private auth: AuthService, private bd: DatabaseService,
		private complementos: ComplementosService, public router: Router) { }

	ngOnInit() { }

	public loginGoogle() {
		this.splash = true;
		this.auth.loginGoogle().then(promesa => {
			if (promesa !== 'creado') {
				this.resolveLogin(promesa);
			} else {
				this.complementos.presentToastConMensajeYColor('Se ha registrado en la base de datos. espere a que un dueño o supervisor le de de alta', 'success');
			}
		}).catch(err => this.complementos.presentToastConMensajeYColor(firebaseErrors(err), 'danger')).finally(() => {
			this.splash = false;
		});
	}

	public onSubmitLogin() {
		this.splash = true;
		this.auth.login(this.email, this.password).then(res => {
			this.resolveLogin(res);
		}).catch(err => this.complementos.presentToastConMensajeYColor(firebaseErrors(err), 'danger')).finally(() => {
			this.splash = false;
		});
	}

	resolveLogin(res) {
		return this.bd.obtenerPorIdPromise('usuarios', res).then(user => {
			if (user.data().estado === true) {
				localStorage.setItem('uidUsuario', res);
				localStorage.setItem('tieneCorreo', 'conCorreo');
				this.onClearAll();
				this.complementos.playAudio('success');
				this.router.navigate(['/home']);
			}
			else if (user.data().estado === false) {
				this.complementos.presentToastConMensajeYColor('Esta cuenta aun no esta habilitada.', 'danger');
			} else if (user.data().estado === null) {
				this.complementos.presentToastConMensajeYColor('Esta cuenta fue rechazada. no podras acceder con ella', 'danger');
			}
		});
	}

	public onClearAll() {
		this.email = null;
		this.password = null;
	}

	pickerUser(pickedName) {
		this.listaUsuarios.forEach((user) => {
			if (user.correo === pickedName) {
				this.email = user.correo;
				this.password = user.clave;
			}
		});
	}

	registrarUsuario() {
		this.router.navigate(['/alta-cliente']);
	}
}
