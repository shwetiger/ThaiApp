import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotiListComponent } from './components/noti-list/noti-list.component';
import { NotiDetailComponent } from './components/noti-detail/noti-detail.component';
import { AuthGuard } from '../../shared/service/auth.guard';


const routes: Routes = [
  {
    path: '' , component: NotiListComponent
  },
  {
    path: 'detail/:id', component: NotiDetailComponent,canActivate: [AuthGuard]
    
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotiRoutingModule { }
