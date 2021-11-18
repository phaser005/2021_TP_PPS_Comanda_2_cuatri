import { Component, OnInit } from '@angular/core';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AuthService } from 'src/app/servicios/auth.service';
import { ComplementosService } from 'src/app/servicios/complementos.service';
import { DatabaseService } from 'src/app/servicios/database.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { firebaseErrors } from 'src/assets/scripts/errores';
import { FmcService } from 'src/app/servicios/fmc.service';

@Component({
  selector: 'app-alta-cliente',
  templateUrl: './alta-cliente.page.html',
  styleUrls: ['./alta-cliente.page.scss'],
})
export class AltaClientePage implements OnInit {
  pickedName: string = "Cliente";
  miFormularioAnonimo: FormGroup;
  miFormulario: FormGroup;
  splash: boolean = false;
  usuarioJson = {
    foto: "../../assets/SVG.svg",
    perfil: "Cliente",
    estado: false,
    estadoMesa: false,
  };
  barcodeOptions = {
    "prompt": "Place a barcode inside the scan area",
    "formats": "QR_CODE,PDF_417",
    "orientation": "landscape"
  };
  listaPerfiles = [
    { perfil: "Cliente" },
    { perfil: "Anonimo" }
  ];

  constructor(
    private router: Router,
    private qr: BarcodeScanner,
    private camera: Camera,
    private bd: DatabaseService,
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private complemetos: ComplementosService,
    private fmc: FmcService) {
    this.miFormulario = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑ]{3,20}$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑ]{3,20}$')]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      contrasenia: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑ0-9_-]{6,18}$')]],
      correo: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+\\s*$')]],
    });
    this.miFormularioAnonimo = this.formBuilder.group({
      nombreAnonimo: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑ]{3,20}$')]],
    });
  }

  validation_messages = {
    'nombre': [
      { type: 'required', message: 'El nombre es requerido.' },
      { type: 'pattern', message: 'Introduzca un nombre de mínimo 3 a 20 caracteres y no números.' }
    ],
    'nombreAnonimo': [
      { type: 'required', message: 'El nombre es requerido.' },
      { type: 'pattern', message: 'Introduzca un nombre de mínimo 3 a 20 caracteres y no números.' }
    ],
    'apellido': [
      { type: 'required', message: 'El apellido es requerido.' },
      { type: 'pattern', message: 'Introduzca un apellido de mínimo 3 a 20 caracteres y no números.' }
    ],
    'dni': [
      { type: 'required', message: 'El DNI es requerido.' },
      { type: 'pattern', message: 'Introduzca un DNI válido(8 caracteres).' }
    ],
    'correo': [
      { type: 'required', message: 'El correo electronico es requerido.' },
      { type: 'pattern', message: 'Introduzca un correo electrónico válido.' }
    ],
    'contrasenia': [
      { type: 'required', message: 'La contraseña es requerida.' },
      { type: 'pattern', message: 'La contraseña debe tener entre 6 y 18 caracteres.' }
    ]
  };

  ngOnInit() {
    this.usuarioJson.perfil = "Cliente";
  }

  pickerUser(pickedName) {
    this.usuarioJson.perfil = pickedName;
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
      this.usuarioJson.foto = base64Str;
    });
  }
  escanearDni() {
    let auxDni;
    let scanSub = this.qr.scan(this.barcodeOptions).then(dataString => {
      let x: any = [];
      x = dataString.text.split('@');
      if (x.length == 8 || x.length == 9) {
        this.miFormulario.controls.apellido.setValue(x[1]);
        this.miFormulario.controls.nombre.setValue(x[2]);
        this.miFormulario.controls.dni.setValue(x[4]);
      } else {
        this.miFormulario.controls.dni.setValue(x[1]);
        this.miFormulario.controls.apellido.setValue(x[4]);
        this.miFormulario.controls.nombre.setValue(x[5]);
      }
    });
  }

  registrar() {
    this.splash = true;
    if (this.pickedName == "Cliente") {
      this.usuarioJson['nombre'] = this.miFormulario.value.nombre;
      this.usuarioJson['apellido'] = this.miFormulario.value.apellido;
      this.usuarioJson['dni'] = this.miFormulario.value.dni;
      this.usuarioJson['correo'] = this.miFormulario.value.correo;
      this.usuarioJson['contrasenia'] = this.miFormulario.value.contrasenia;
      this.auth.registrarUsuario(this.usuarioJson).then(() => {
        this.limpiarCampos();
        this.complemetos.presentToastConMensajeYColor("El estado del cliente esta pendiente al registro.", "primary");
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      }).catch(err => {
        this.complemetos.presentToastConMensajeYColor(firebaseErrors(err), "danger");
      }).finally(() => {
        this.fmc.enviarNotificacion('nuevoCliente','se ha registrado un nuevo cliente','Grupo');
        this.splash = false;
      });
    } else {
      this.usuarioJson.estado = true;
      this.usuarioJson['nombre'] = this.miFormularioAnonimo.value.nombreAnonimo;
      this.auth.registrarUsuarioAnonimo(this.usuarioJson).then(id => {
        localStorage.setItem('uidUsuario', id);
        localStorage.setItem('tieneCorreo', 'sinCorreo');
        this.limpiarCampos();
        this.complemetos.presentToastConMensajeYColor("Anónimo exitoso", "primary");
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 3000);
      }).catch(err => {
        this.complemetos.presentToastConMensajeYColor(firebaseErrors(err), "danger");
      }).finally(() => {
        this.splash = false;
      });
    }
  }

  limpiarCampos() {
    this.pickedName = 'Cliente';
    this.usuarioJson = {
      foto: "../../assets/SVG.svg",
      perfil: "Cliente",
      estado: false,
      estadoMesa: false,
    };
  }
}
