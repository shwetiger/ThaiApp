import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageNotfoundComponent } from './modules/pages/page-notfound/page-notfound.component';
import { NotiDetailWithoutIdComponent }from './modules/pages/noti-detail-without-id/noti-detail-without-id.component';
import { HomeComponent } from './modules/home/components/home/home.component';
import { AuthGuard } from './shared/service/auth.guard';

const routes: Routes = [
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
    //lazy loading
    {
      path: 'home',
      loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
    },
    {
      path: 'home/:deviceId',component: HomeComponent
    },
    {
      path: 'home/:deviceId/:fcmToken',component: HomeComponent
    },
    // {
    //   path: 'home/:deviceId', loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
    // },
    // {
    //   path: 'home/:deviceId/:fcmToken', loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
    // },
    {
      path: 'service-phone', loadChildren: () => import('./modules/service-phone/service-phone.module').then(m => m.ServicePhoneModule)
    },
    {
      path : 'me-page', loadChildren: () => import('./modules/profile/profile.module').then(m => m.ProfileModule)
    },
    {
      path : 'me-page/:deviceId', loadChildren: () => import('./modules/profile/profile.module').then(m => m.ProfileModule)
    },
    {
      path : 'login', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
    },
    {
      path : 'login/:deviceId', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
    },
    //download
    {
      path: 'download' , loadChildren: () => import('./modules/download-page/download-page.module').then(m => m.DownloadPageModule)
    },
    //noti
    {
      path: 'noti' , loadChildren: () => import('./modules/noti/noti.module').then(m => m.NotiModule)
    },
    // twod
    {
      path: 'twod' , loadChildren: () => import('./modules/twod/twod.module').then(m => m.TwodModule)
    },
    //threed
    {
      path: 'threed' , loadChildren: () => import('./modules/threed/threed.module').then(m=>m.ThreedModule)
    },
    {
      path: 'promotions', loadChildren: ()=> import('./modules/promotion/promotion.module').then(m=>m.PromotionModule)
    },
    {
      path: 'wallet', loadChildren: ()=> import('./modules/wallet/wallet.module').then(m=>m.WalletModule),canActivate:[AuthGuard]
    },
    {
      path: 'wallet/:showBackButton', loadChildren: ()=> import('./modules/wallet/wallet.module').then(m=>m.WalletModule)
    },
    {
      path: 'game', loadChildren: ()=> import('./modules/game/game.module').then(m=> m.GameModule)
    },
    {
      path: 'noti-direct-show/:data', component: NotiDetailWithoutIdComponent
    },
    {
      path: '**', component: PageNotfoundComponent
    }

];
const config: ExtraOptions = {
  useHash: true,
  enableTracing: false // Turn this on to log routing events to the console
  // ,preloadingStrategy: PreloadAllModules
};

@NgModule({
  //{onSameUrlNavigation: 'reload'}
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]

})
export class AppRoutingModule { }