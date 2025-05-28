import { Routes } from '@angular/router';
import { CreadorTableroComponent } from './creador-tablero/creador-tablero.component';
import { MisTablerosComponent } from './mis-tableros/mis-tableros.component';

export const routes: Routes = [
    {path: '', component: MisTablerosComponent},
    {path: 'tablero', component: CreadorTableroComponent}
];
