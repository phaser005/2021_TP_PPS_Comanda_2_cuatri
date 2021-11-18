import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { DatabaseService } from 'src/app/servicios/database.service';
import { ComplementosService } from 'src/app/servicios/complementos.service';
import { firebaseErrors } from '../../../assets/scripts/errores';
import firebase from 'firebase/app';

@Component({
	selector: 'seccion-encuestas',
	templateUrl: './seccion-encuestas.component.html',
	styleUrls: ['./seccion-encuestas.component.scss'],
})
export class SeccionEncuestasComponent implements OnInit {
	@Input() usuario: any;
	@Input() flagEncuesta: any;
	@Output() encuesta: EventEmitter<void> = new EventEmitter<void>();
	public splash = false;
	public pathImagenesEncuesta = ['A', 'B', 'C'];
	public pathImagen = [];
	public contadorInterno;
	public gradoSatisfaccion = 0;
	public califRestaurante: Array<any> = [
		{ puntaje: 1, texto: 'Muy mala 😠'} ,
		{ puntaje: 2, texto: 'Mala 😡'} ,
		{ puntaje: 3, texto: 'Regular 😐'} ,
		{ puntaje: 4, texto: 'Buena 🙂'} ,
		{ puntaje: 5, texto: 'Muy buena 😊'} ,
	];
	public jsonEncuesta = {
		calificacion_app: null,
		calificacion_restaurante: null,
		participacion_juegos: false,
		propina: false,
		recomendaciones: null,
		fotos: ['https://i.imgur.com/zH3i014.png', 'https://i.imgur.com/zH3i014.png', 'https://i.imgur.com/zH3i014.png'],
	}
	constructor(private bd: DatabaseService, public complemento: ComplementosService, private camera: Camera, private builder: FormBuilder) { }
	public encuestaCliente: FormGroup = this.builder.group({
		calificacion_app: [null, Validators.required],
		calificacion_restaurante: [null, Validators.required],
		participacion_juegos: [false, Validators.required],
		propina: [false],
		recomendaciones: [null],
	})

	ngOnInit() {
		this.contadorInterno = 2;
	}
	tomarFotosEncuesta() {
		const options: CameraOptions = {
			quality: 100,
			targetHeight: 600,
			targetWidth: 600,
			destinationType: this.camera.DestinationType.DATA_URL,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.PICTURE,
			correctOrientation: true
		}
		this.camera.getPicture(options).then((imageData) => {
			var base64Str = 'data:image/jpeg;base64,' + imageData;
			this.jsonEncuesta.fotos[this.contadorInterno] = base64Str;
			var storageRef = firebase.storage().ref();
			let obtenerMili = new Date().getTime();
			var nombreFoto = "fotosEncuesta/" + obtenerMili + "." + ".jpg";
			var childRef = storageRef.child(nombreFoto);
			this.pathImagenesEncuesta[this.contadorInterno] = nombreFoto;
			childRef.putString(base64Str, 'data_url').then(function(snapshot) { })
		}, (Err) => {
			alert(JSON.stringify(Err));
		})
	}

	manejadorEncuesta() {
		this.tomarFotosEncuesta();
		//this.contadorInterno += 1;
	}

	cambioRango(event) {
		this.gradoSatisfaccion = event.detail.value;
		this.encuestaCliente.controls.calificacion_app.setValue(event.detail.value);
	}

	califRest(event) {
		this.encuestaCliente.controls.calificacion_restaurante.setValue(event.detail.value);
	}

	enviarEncuesta() {
		this.splash = true;
		console.log(this.jsonEncuesta.fotos);
		if (this.encuestaCliente.valid && this.jsonEncuesta.fotos.length === 3) {
			this.jsonEncuesta.calificacion_app = this.encuestaCliente.value.calificacion_app;
			this.jsonEncuesta.calificacion_restaurante = this.encuestaCliente.value.calificacion_restaurante;
			this.jsonEncuesta.participacion_juegos = this.encuestaCliente.value.participacion_juegos;
			this.jsonEncuesta.propina = this.encuestaCliente.value.propina;
			this.jsonEncuesta.recomendaciones = this.encuestaCliente.value.recomendaciones;
			this.bd.crear('encuestas', this.jsonEncuesta).then(() => {
				this.complemento.presentToastConMensajeYColor('¡Su encuesta se finalizo con exito!', 'success');
				this.splash = false;
				this.contadorInterno = -1;
			}).finally(() => this.limpiarCampos());
		} else {
			this.splash = false;
			this.complemento.presentToastConMensajeYColor('¡Hay campos obligatorios sin completar!', 'danger');
		}
	}

	limpiarCampos() {
		this.encuestaCliente.reset({
			calificacion_app: null,
			calificacion_restaurante: null,
			participacion_juegos: false,
			propina: false,
			recomendaciones: null,
		});
		this.jsonEncuesta = {
			calificacion_app: null,
			calificacion_restaurante: null,
			participacion_juegos: false,
			propina: false,
			recomendaciones: null,
			fotos: ['https://i.imgur.com/zH3i014.png', 'https://i.imgur.com/zH3i014.png', 'https://i.imgur.com/zH3i014.png'],
		}
		this.gradoSatisfaccion = 0;
		this.encuesta.emit();
	}

}
