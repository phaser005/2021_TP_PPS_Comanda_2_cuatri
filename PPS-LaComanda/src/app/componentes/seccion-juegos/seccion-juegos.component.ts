import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ComplementosService } from 'src/app/servicios/complementos.service';

@Component({
	selector: 'seccion-juegos',
	templateUrl: './seccion-juegos.component.html',
	styleUrls: ['./seccion-juegos.component.scss'],
})
export class SeccionJuegosComponent implements OnInit {
	@Input() usuario: any;
	@Input() juego: string;
	@Output() beneficio: EventEmitter<string> = new EventEmitter<string>();
	@ViewChild('coin', { static: false }) moneda: ElementRef<HTMLDivElement>;
	public flagJuego: string = 'Descuento 10%';
	public valor;
	constructor(private rT: Renderer2, private complemento: ComplementosService) { }
	ngOnInit() { }

	elegirJuego(tipo) {
		this.flagJuego = tipo;
	}

	jugarLanzarMoneda() {
		var flipResult = Math.random();
		this.rT.removeClass(this.moneda.nativeElement, 'cara');
		this.rT.removeClass(this.moneda.nativeElement, 'cruz');
		setTimeout(() => {
			if (flipResult <= 0.5) {
				this.rT.addClass(this.moneda.nativeElement, 'cara');
				console.log('cara');
				this.valor = 'cara';
			}
			else {
				this.rT.addClass(this.moneda.nativeElement, 'cruz');
				console.log('cruz');
				this.valor = 'cruz';
			}
		}, 50);
		setTimeout(() => {
			if (this.valor === 'cara') {
				this.complemento.presentToastConMensajeYColor('ganaste tu beneficio!', 'success');
				this.beneficio.emit(this.flagJuego);
			} else {
				this.complemento.presentToastConMensajeYColor('perdiste tu beneficio!', 'danger');
				this.beneficio.emit(null);
			}
		}, 4000)
	}



}
