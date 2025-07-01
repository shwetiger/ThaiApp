import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PromotionListComponent } from './components/promotion-list/promotion-list.component';
import { PromotionDetailComponent } from './components/promotion-detail/promotion-detail.component';

const routes: Routes = [
  { path:'', component: PromotionListComponent },      
  {
    path : 'detail/:id',component: PromotionDetailComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromotionRoutingModule { }
