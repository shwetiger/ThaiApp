import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DownloadPageComponent } from './components/download-page/download-page.component';
import { IosDownloadPageComponent } from './components/ios-download-page/ios-download-page.component';
const routes: Routes = [  
  {
    path: '', component: DownloadPageComponent
  }, 
  {
    path: 'ios-download', component: IosDownloadPageComponent
  },

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DownloadPageRoutingModule { }
