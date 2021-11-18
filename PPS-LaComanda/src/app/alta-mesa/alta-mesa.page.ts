import { Component, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { DatabaseService } from 'src/app/servicios/database.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { AngularFireStorage } from "@angular/fire/storage";
import { Usuariosbd } from "../clases/usuariosbd";
import { ComplementosService } from 'src/app/servicios/complementos.service';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import firebase from 'firebase/app';
import { firebaseErrors } from 'src/assets/scripts/errores';

@Component({
  selector: 'app-alta-mesa',
  templateUrl: './alta-mesa.page.html',
  styleUrls: ['./alta-mesa.page.scss'],
})
export class AltaMesaPage implements OnInit {
  pickedName: string = 'Por defecto';
  miFormulario: FormGroup;
  splash: boolean = false;
  mesaJson = {
    tipo: "",
    foto: "../../assets/SVG.svg",
    estado: "Libre",
    cliente: null,
  };
  listaTipo = [
    { tipo: "Por defecto" },
    { tipo: "VIP" },
    { tipo: "Discapacitados" },
  ]

  constructor(
    private camera: Camera,
    private bd: DatabaseService,
    private formBuilder: FormBuilder,
    private st: AngularFireStorage,
    private complemetos: ComplementosService) {
    this.miFormulario = this.formBuilder.group({
      comensales: ['', [Validators.required, Validators.min(1),Validators.max(99)]],
      numero: ['', [Validators.required, Validators.min(1),Validators.max(99)]],
    });
  }
  validation_messages = {
    'numero': [
      { type: 'required', message: 'El numero es requerido.' },
      { type: 'min', message: 'Introduzca un numero mayor a 0.' },
      { type: 'max', message: 'Introduzca un numero menor a 100.' }
    ],
    'comensales': [
      { type: 'required', message: 'Los comensales son requeridos.' },
      { type: 'min', message: 'Introduzca un numero mayor a 0.' },
      { type: 'max', message: 'Introduzca un numero menor a 100.' }
    ],
  };

  ngOnInit() {
    this.mesaJson.tipo = this.pickedName;
  }

  pickerUser(pickedName) {
    this.mesaJson.tipo = pickedName;
  }

  tomarFotografia() {
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
      this.mesaJson.foto = base64Str;
    });
  }

  registrar() {
    this.splash = true;
    this.mesaJson['comensales'] = this.miFormulario.value.comensales;
    this.mesaJson['numero'] = this.miFormulario.value.numero;
    if (!this.mesaJson.foto.includes('SVG.svg')) {
      let nombreFoto = "mesas/" + Date.now() + "." + this.mesaJson['numero'] + ".jpg";
      this.bd.obtenerTodosPromise('mesas').then(snaps => {
        if (snaps.docs.findIndex(doc => doc.data().numero === this.mesaJson['numero']) !== -1) {
          throw new Error();
        }
      }).then(() => {
        return this.bd.subirImagen(nombreFoto, this.mesaJson.foto);
      }).then(url => {
        this.mesaJson.foto = url;
        return this.bd.crear('mesas', this.mesaJson);
      }).then(() => {
        this.limpiarCampos();
        this.complemetos.presentToastConMensajeYColor("la mesa fue cargada con exito", "primary");
      }).catch(err => {
        if (err.code == undefined) {
          this.complemetos.presentToastConMensajeYColor('este numero de mesa ya existe', 'danger');
        } else {
          this.complemetos.presentToastConMensajeYColor(firebaseErrors(err), "danger");
        }
      }).finally(() => {
        this.splash = false;
      });
    } else {
      this.bd.obtenerTodosPromise('mesas').then(snaps => {
        if (snaps.docs.findIndex(doc => doc.data().numero === this.mesaJson['numero']) !== -1) {
          throw new Error();
        }
      }).then(() => {
        return this.bd.crear('mesas', this.mesaJson)
      }).then(() => {
        this.limpiarCampos();
        this.complemetos.presentToastConMensajeYColor("la mesa fue cargada con exito", "primary");
      }).catch(err => {
        if (err.code == undefined) {
          this.complemetos.presentToastConMensajeYColor('este numero de mesa ya existe', 'danger');
        } else {
          this.complemetos.presentToastConMensajeYColor(firebaseErrors(err), "danger");
        }
      }).finally(() => {
        this.splash = false;
      });
    }
  }

  limpiarCampos() {
    this.pickedName = "Por defecto";
    this.mesaJson.foto = "../../assets/SVG.svg";
    this.mesaJson.tipo = this.pickedName;
    this.mesaJson.estado = "Libre";
    this.mesaJson.cliente = null;
  }
}
