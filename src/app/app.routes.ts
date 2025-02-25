import { Routes } from '@angular/router';
import { MainpageComponent } from './mainpage/mainpage.component';
import { IframepageComponent } from './iframepage/iframepage.component';

export const routes: Routes = [
  { path: 'mainpage', component: MainpageComponent, data: { showTitle: true } },
  { path: 'iframepage', component: IframepageComponent, data: { showTitle: false } },
  { path: '', redirectTo: 'mainpage', pathMatch: 'full' }
];
