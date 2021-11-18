import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";


@Component({
	selector: 'seccion-metre',
	templateUrl: './seccion-metre.component.html',
	styleUrls: ['./seccion-metre.component.scss'],
})
export class SeccionMetreComponent implements OnInit {
	@Input() listaEspera: Array<any>;

	constructor(private router: Router) { }

	ngOnInit() {}

	comprobarMesas(item) {
		localStorage.setItem('itemListaDeEspera', JSON.stringify(item));
		this.router.navigate(['/listado-mesas']);
	}

}
