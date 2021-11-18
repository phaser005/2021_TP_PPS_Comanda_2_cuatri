import { Component, OnInit } from '@angular/core';
import { ComplementosService } from 'src/app/servicios/complementos.service';
import { DatabaseService } from 'src/app/servicios/database.service';
import { Router } from '@angular/router';
import { firebaseErrors } from 'src/assets/scripts/errores';

@Component({
  selector: 'app-listado-mesas',
  templateUrl: './listado-mesas.page.html',
  styleUrls: ['./listado-mesas.page.scss'],
})
export class ListadoMesasPage implements OnInit {
  splash: boolean = false;
  listadoMesas = [];
  item: any = {};
  constructor(private complementos: ComplementosService, private bd: DatabaseService, private router: Router) { }

  ngOnInit() {
    this.splash = true;
    this.item = JSON.parse(localStorage.getItem('itemListaDeEspera'));
    let fb = this.bd.obtenerTodosTiempoReal('mesas').onSnapshot(datos => {
      this.listadoMesas = datos.docs.map(dato => {
        const x: any = dato.data() as any;
        x['id'] = dato.id;
        return { ...x };
      });
      this.splash = false;
    }, err => { this.complementos.presentToastConMensajeYColor(firebaseErrors(err), 'danger'); });
  }

  asignarMesa(mesita) {
    if (this.item.comensales !== null || this.item.comensales) {
      if (this.item.comensales === mesita.comensales) {
        if (this.item.tipo !== null || this.item.tipo) {
          if (this.item.tipo === mesita.tipo) {
            this.procesoAsignacion(mesita)
          } else {
            this.complementos.presentToastConMensajeYColor('La mesa seleccionada no cumple con los parametros del cliente.', 'danger');
          }
        } else {
          this.procesoAsignacion(mesita)
        }
      } else {
        this.complementos.presentToastConMensajeYColor('La mesa seleccionada no cumple con los parametros del cliente.', 'danger');
      }
    } else {
      if (this.item.tipo !== null || this.item.tipo) {
        if (this.item.tipo === mesita.tipo) {
          this.procesoAsignacion(mesita)
        } else {
          this.complementos.presentToastConMensajeYColor('La mesa seleccionada no cumple con los parametros del cliente.', 'danger');
        }
      } else {
        this.procesoAsignacion(mesita)
      }
    }
  }

  procesoAsignacion(mesita) {
    let aux = {
      estado: 'Ocupada',
      cliente: this.item.idCliente,
      comensales: mesita.comensales,
      tipo: mesita.tipo,
      foto: mesita.foto,
      numero: mesita.numero,
    }
    this.bd.actualizar('mesas', aux, mesita.id).then(() => {
      return this.bd.eliminar('listaEspera', this.item.id)
    }).then(() => {
      return this.bd.obtenerPorIdPromise('usuarios', this.item.idCliente).then(snap => {
        const user: any = snap.data() as any;
        user.estadoMesa = mesita.id;
        return this.bd.actualizar('usuarios', user, this.item.idCliente);
      });
    }).then(() => {
      localStorage.removeItem('itemListaDeEspera');
      return this.bd.eliminar('listaEspera', this.item.id);
    }).then(() => {
      this.complementos.presentToastConMensajeYColor('¡Mesa asignada a cliente!', 'success');
      this.router.navigate(['/home']);
    }).catch(err => this.complementos.presentToastConMensajeYColor(firebaseErrors(err), 'danger'));
  }
}
