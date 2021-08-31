import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomerComponent } from './customer/customer.component';
import { ShowDeleteComponent } from './customer/show-delete/show-delete.component';
import { SharedService } from './shared.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FindComponent } from './customer/find/find.component';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import {
  GoogleLoginProvider,
} from 'angularx-social-login';
import { ProductComponent } from './customer/show-delete/product/product.component';
import { CarComponent } from './customer/show-delete/car/car.component';
import { AnalyzeComponent } from './customer/show-delete/car/analyze/analyze.component';

@NgModule({
  declarations: [
    AppComponent,
    CustomerComponent,
    ShowDeleteComponent,
    FindComponent,
    ProductComponent,
    CarComponent,
    AnalyzeComponent,
  ],
  imports: [
    BrowserModule,
    SocialLoginModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [SharedService, {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '213409767336-03goc95qgie67gmuikcpr0ij1su2oor8.apps.googleusercontent.com'
            )
          },
        ]
      } as SocialAuthServiceConfig,
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }
