// src/app/app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgxChessBoardModule } from 'ngx-chess-board';

import { AppComponent } from './app.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { IframepageComponent } from './iframepage/iframepage.component';
import { routes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    MainpageComponent,
    IframepageComponent
  ],
  imports: [
    BrowserModule,
    NgxChessBoardModule.forRoot(), // <-- Import the chess board module here
    RouterModule.forRoot(routes)
  ],
  // Adding CUSTOM_ELEMENTS_SCHEMA can help if Angular still complains about unknown elements.
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}