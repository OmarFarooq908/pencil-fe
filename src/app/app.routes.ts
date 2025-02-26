import { Routes } from '@angular/router';
import { MainpageComponent } from './mainpage/mainpage.component';
import { IframepageComponent } from './iframepage/iframepage.component';
import { OnlineGameComponent } from './online-game/online-game.component';

export const routes: Routes = [
  { path: 'mainpage', component: MainpageComponent, data: { showTitle: true } },
  { path: 'iframepage', component: IframepageComponent, data: { showTitle: false } },
  { path: 'online-game', component: OnlineGameComponent, data: { showTitle: false }},
  { path: '', redirectTo: 'mainpage', pathMatch: 'full' }
];
