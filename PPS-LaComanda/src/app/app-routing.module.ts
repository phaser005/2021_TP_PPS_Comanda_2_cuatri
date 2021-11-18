import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'alta-supervisor', loadChildren: () => import('./alta-supervisor/alta-supervisor.module').then(m => m.AltaSupervisorPageModule) },
  { path: 'alta-empleado', loadChildren: () => import('./alta-empleado/alta-empleado.module').then(m => m.AltaEmpleadoPageModule) },
  { path: 'alta-producto', loadChildren: () => import('./alta-producto/alta-producto.module').then(m => m.AltaProductoPageModule) },
  { path: 'alta-mesa', loadChildren: () => import('./alta-mesa/alta-mesa.module').then(m => m.AltaMesaPageModule) },
  { path: 'alta-cliente', loadChildren: () => import('./alta-cliente/alta-cliente.module').then(m => m.AltaClientePageModule) },
  { path: 'listado-mesas', loadChildren: () => import('./listado-mesas/listado-mesas.module').then(m => m.ListadoMesasPageModule) },
  { path: 'realizar-pedido', loadChildren: () => import('./realizar-pedido/realizar-pedido.module').then(m => m.RealizarPedidoPageModule) },
  { path: 'encuestas', loadChildren: () => import('./encuestas/encuestas.module').then(m => m.EncuestasPageModule) },
  { path: 'alta-reserva', loadChildren: () => import('./reservas/reservas.module').then(m => m.ReservasPageModule) },

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
