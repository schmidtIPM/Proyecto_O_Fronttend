import { Routes } from '@angular/router';
import { CreadorTableroComponent } from './creador-tablero/creador-tablero.component';
import { MisTablerosComponent } from './mis-tableros/mis-tableros.component';
import { ActualizarTableroComponent } from './actualizar-tablero/actualizar-tablero.component';
import { Tablero } from './models';
import { SimuladorTableroComponent } from './simulador-tablero/simulador-tablero.component';
import { PreguntasFrecuentesComponent } from './preguntas-frecuentes/preguntas-frecuentes.component';

export const routes: Routes = [
    {path: '', component: MisTablerosComponent},
    {path: 'creador-de-tableros', component: CreadorTableroComponent},
    {path: 'actualizador-de-tableros/:id', component: ActualizarTableroComponent},
    {path: 'tablero/:id', component: SimuladorTableroComponent},
    {path: 'preguntas-frecuentes', component: PreguntasFrecuentesComponent}
];
