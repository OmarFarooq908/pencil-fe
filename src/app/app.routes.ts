import { Routes } from '@angular/router';
import { MainpageComponent } from './mainpage/mainpage.component';
import { IframepageComponent } from './iframepage/iframepage.component';

export const routes: Routes = [
  { path: 'mainpage', component: MainpageComponent },
  { path: 'iframepage', component: IframepageComponent },
  { path: '', redirectTo: 'mainpage', pathMatch: 'full' }
];
