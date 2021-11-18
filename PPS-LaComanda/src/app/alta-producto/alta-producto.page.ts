import { Component, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { DatabaseService } from 'src/app/servicios/database.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import firebase from 'firebase/app';
import { AngularFirestore } from "@angular/fire/firestore"
import { ComplementosService } from 'src/app/servicios/complementos.service';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { firebaseErrors } from 'src/assets/scripts/errores';

@Component({
  selector: 'app-alta-producto',
  templateUrl: './alta-producto.page.html',
  styleUrls: ['./alta-producto.page.scss'],
})
export class AltaProductoPage implements OnInit {
  splash: boolean = false;
  pickedName: string = '';
  miFormulario: FormGroup;
  productoJson = {
    tipo: "",
    fotos: ['../../assets/SVG.svg', '../../assets/SVG.svg', '../../assets/SVG.svg'],
  };
  listaProductos = [
    { tipo: "Plato" },
    { tipo: "Bebida" },
    { tipo: "Postre" }
  ]

  constructor(
    private qr: BarcodeScanner,
    private camera: Camera,
    private bd: DatabaseService,
    private formBuilder: FormBuilder,
    private fire: AngularFirestore,
    private complemetos: ComplementosService) {
    this.miFormulario = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑ ]{3,25}$')]],
      descripcion: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑ ]{3,50}$')]],
      tiempo: ['', [Validators.required, Validators.min(0),Validators.max(9999)]],
      precio: ['', [Validators.required, Validators.min(0),Validators.max(9999)]],
    });
  }

  validation_messages = {
    'nombre': [
      { type: 'required', message: 'El nombre es requerido.' },
      { type: 'pattern', message: 'Introduzca un nombre de mínimo 3 a 10 caracteres y no números.' }
    ],
    'descripcion': [
      { type: 'required', message: 'El descripcion es requerida.' },
      { type: 'pattern', message: 'Introduzca una descripcion de mínimo 3 a 20 caracteres y no números.' }
    ],
    'tiempo': [
      { type: 'required', message: 'El tiempo es requerido.' },
      { type: 'min', message: 'Introduzca un numero mayor a 0.' },
      { type: 'max', message: 'Introduzca un numero menor a 10000.' }
    ],
    'precio': [
      { type: 'required', message: 'El precio es requerido.' },
      { type: 'min', message: 'Introduzca un numero mayor a 0.' },
      { type: 'max', message: 'Introduzca un numero menor a 10000.' }
    ],
  };

  ngOnInit() {
    let uid = localStorage.getItem('uidUsuario');
    this.bd.obtenerPorIdPromise('usuarios', uid).then(user => {
      if (user.data().perfil === 'Cocinero') {
        this.listaProductos = [
          { tipo: "Plato" },
          { tipo: "Postre" }
        ]
      } else if (user.data().perfil === 'Bartender') {
        this.listaProductos = [
          { tipo: "Bebida" },

        ]
      }
      return this.listaProductos;
    }).then(productos => {
      this.pickedName = productos[0].tipo;
      this.productoJson.tipo = this.pickedName;
    });
  }

  pickerUser(pickedName) {
    this.productoJson.tipo = pickedName;
  }

  tomarFotografia(indice) {
    if (this.productoJson.fotos.length <= 3) {
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
        this.productoJson.fotos[indice] = base64Str;
      });
    }
    else {
      this.complemetos.presentToastConMensajeYColor("No se puede cargar mas fotos", "primary");
    }
  }

  registrar() {
    if (this.productoJson.fotos.indexOf(null) === -1 && this.productoJson.fotos.indexOf('../../assets/SVG.svg') === -1) {
      this.splash = true;
      this.productoJson['nombre'] = this.miFormulario.value.nombre;
      this.productoJson['descripcion'] = this.miFormulario.value.descripcion;
      this.productoJson['tiempo'] = this.miFormulario.value.tiempo;
      this.productoJson['precio'] = this.miFormulario.value.precio;
      return this.fire.collection('productos').add({ nombre: null }).then(ref => ref.id).then(docId => {
        let fotoUno = "productos/" + Date.now() + "." + docId + "_1.jpg";
        return this.bd.subirImagen(fotoUno, this.productoJson.fotos[0]).then(url1 => {
          this.productoJson.fotos[0] = url1;
          let fotoDos = "productos/" + Date.now() + "." + docId + "_2.jpg";
          return this.bd.subirImagen(fotoDos, this.productoJson.fotos[1])
        }).then(url2 => {
          this.productoJson.fotos[1] = url2;
          let fotoTres = "productos/" + Date.now() + "." + docId + "_3.jpg";
          return this.bd.subirImagen(fotoTres, this.productoJson.fotos[2])
        }).then(url3 => {
          this.productoJson.fotos[2] = url3;
          return docId;
        });
        return docId;
      }).then(docId => {
        return this.bd.actualizar('productos', this.productoJson, docId);
      }).then(() => {
        this.limpiarCampos();
        this.complemetos.presentToastConMensajeYColor("El producto fue cargado con exito", "primary");
      }).catch(err => {
        this.complemetos.presentToastConMensajeYColor(firebaseErrors(err), "danger");
      }).finally(() => {
        this.splash = false;
      });
    } else {
      this.complemetos.presentToastConMensajeYColor("¡El producto debe tener 3 imagenes!", "danger");
    }
  }

  limpiarCampos() {
    this.pickedName = this.listaProductos[0].tipo;
    this.productoJson = {
      tipo: this.pickedName,
      fotos: ['../../assets/icon/SVG.svg', '../../assets/icon/SVG.svg', '../../assets/icon/SVG.svg'],
    };
  }
}
