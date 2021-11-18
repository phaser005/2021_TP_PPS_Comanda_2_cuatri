import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/servicios/database.service';
declare var google;

@Component({
  selector: 'app-encuestas',
  templateUrl: './encuestas.page.html',
  styleUrls: ['./encuestas.page.scss'],
})
export class EncuestasPage implements OnInit {
  splash = false;
  constructor(private bd: DatabaseService) { }
  cantEncuestas = -1;
  clienteUno: any = { muyMalo: 0, malo: 0, regular: 0, bueno: 0, muyBueno: 0 };
  clienteDos: any = { muyMalo: 0, malo: 0, regular: 0, bueno: 0, muyBueno: 0 };
  clienteTres: any = { true: 0, false: 0 };
  clienteCuatro: any = { true: 0, false: 0 };
  clienteCinco: any = { true: 0, false: 0 };


  ngOnInit() {
    this.splash = true;
    let fb = this.bd.obtenerTodosTiempoReal('encuestas').onSnapshot(datos => {
      this.cantEncuestas = datos.docs.length;
      datos.forEach((dato) => {
        const x: any = dato.data() as any;
        switch (x.calificacion_app) {
          case 1:
            this.clienteUno.muyMalo++;
            break;
          case 2:
            this.clienteUno.malo++;
            break;
          case 3:
            this.clienteUno.regular++;
            break;
          case 4:
            this.clienteUno.bueno++;
            break;
          case 5:
            this.clienteUno.muyBueno++;
            break;
        }
        switch (x.calificacion_restaurante) {
          case 1:
            this.clienteDos.muyMalo++;
            break;
          case 2:
            this.clienteDos.malo++;
            break;
          case 3:
            this.clienteDos.regular++;
            break;
          case 4:
            this.clienteDos.bueno++;
            break;
          case 5:
            this.clienteDos.muyBueno++;
            break;
        }
        switch (x.propina) {
          case true:
            this.clienteTres.true++;
            break;
          case false:
            this.clienteTres.false++;
            break;
        }
        switch (x.participacion_juegos) {
          case true:
            this.clienteCuatro.true++;
            break;
          case false:
            this.clienteCuatro.false++;
            break;
        }
        switch (x.recomendaciones) {
          case null:
            this.clienteCinco.true++;
            break;
          default:
            this.clienteCinco.false++;
            break;
        }
      });
      setTimeout(() => {
        let dataTwo = new google.visualization.DataTable();
        dataTwo.addColumn('string', 'Topping');
        dataTwo.addColumn('number', 'Slices');
        dataTwo.addRows([
          ['Muy bueno', this.clienteUno.muyBueno],
          ['Bueno', this.clienteUno.bueno],
          ['Regular', this.clienteUno.regular],
          ['Malo', this.clienteUno.malo],
          ['Muy malo', this.clienteUno.muyMalo],
        ]);
        let optionsTwo = {
          'title': '¿Qué le parecio nuesta app?',
          'width': 400,
          'height': 300,
          'font-size': '100px',
        };
        let chartTwo = new google.visualization.PieChart(document.getElementById('char_div'));
        chartTwo.draw(dataTwo, optionsTwo);
        let data = new google.visualization.DataTable();
        data.addColumn('string', 'Topping');
        data.addColumn('number', 'Slices');
        data.addRows([
          ['Muy bueno', this.clienteDos.muyBueno],
          ['Bueno', this.clienteDos.bueno],
          ['Regular', this.clienteDos.regular],
          ['Malo', this.clienteDos.malo],
          ['Muy malo', this.clienteDos.muyMalo],
        ]);
        let options = {
          'title': '¿Que le parecio el servicio del restaurante?',
          'width': 400,
          'height': 300,
          'font-size': '100px',
        };
        let chart = new google.visualization.PieChart(document.getElementById('char_divTwo'));
        chart.draw(data, options);
        let dataThree = new google.visualization.DataTable();
        dataThree.addColumn('string', 'Topping');
        dataThree.addColumn('number', 'Slices');
        dataThree.addRows([
          ['Si', this.clienteTres.true],
          ['No', this.clienteTres.false],
        ]);
        let optionsThree = {
          'title': '¿Dejaste/vas a dejar propina por tu pedido?',
          'width': 400,
          'height': 300,
          'font-size': '100px',
        };
        let chartThree = new google.visualization.PieChart(document.getElementById('char_divThree'));
        chartThree.draw(dataThree, optionsThree);
        let dataFour = new google.visualization.DataTable();
        dataFour.addColumn('string', 'Topping');
        dataFour.addColumn('number', 'Slices');
        dataFour.addRows([
          ['Si', this.clienteCuatro.true],
          ['No', this.clienteCuatro.false],
        ]);
        let optionsFour = {
          'title': '¿Participaste/vas a participar en los juegos para obtener beneficios?',
          'width': 400,
          'height': 300,
          'font-size': '100px',
        };
        let chartFour = new google.visualization.PieChart(document.getElementById('char_divFour'));
        chartFour.draw(dataFour, optionsFour);
        let dataFive = new google.visualization.DataTable();
        dataFive.addColumn('string', 'Topping');
        dataFive.addColumn('number', 'Slices');
        dataFive.addRows([
          ['Si', this.clienteCinco.true],
          ['No', this.clienteCinco.false],
        ]);
        let optionsFive = {
          'title': '¿Tenés alguna recomendacion extra para dar?',
          'width': 400,
          'height': 300,
          'font-size': '100px',
        };
        let chartFive = new google.visualization.PieChart(document.getElementById('char_divFive'));
        chartFive.draw(dataFive, optionsFive);
      }, 3000);
      setTimeout(() => this.splash = false, 2000)
    });
  }

}
