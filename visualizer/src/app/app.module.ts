import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { DialogComponent } from './main/dialog/dialog.component';
import { DeviceComponent } from './main/dialog/device/device.component';
import { SoundComponent } from './main/dialog/sound/sound.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    DialogComponent,
    DeviceComponent,
    SoundComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
