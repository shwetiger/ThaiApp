import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FeedbackPageComponent } from './components/feedback-page/feedback-page.component';
import { ProfileComponent } from './components/profile/profile.component';
import { InviteCodeComponent } from './components/invite-code/invite-code.component';
import { WithdrawMyAccontComponent } from './components/withdraw-my-accont/withdraw-my-accont.component';
import { BetHistoryPageComponent } from '../pages/bet-history-page/bet-history-page.component';
import { ResultComponent } from '../pages/result/result.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ProfileEditPageComponent } from './components/profile-edit-page/profile-edit-page.component';
import { UserGuideComponent } from './components/user-guide/user-guide.component';
import { DefaultOptSettingComponent } from './components/default-opt-setting/default-opt-setting.component';
import { EmailAddressComponent } from './components/email-address/email-address.component';
import { EmailOtpConfirmComponent } from './components/email-otp-confirm/email-otp-confirm.component';
import { PointsHistoryComponent } from './components/points-history/points-history.component';
import { AuthGuard } from '../../shared/service/auth.guard';

const routes: Routes = [
  {
    path: '', component: ProfileComponent
  },
  {
    path: 'feedback', component: FeedbackPageComponent,canActivate:[AuthGuard]
  },
  {
    path: 'user-guide', component: UserGuideComponent,canActivate:[AuthGuard]
  },
  {
    path: 'invite-code', component: InviteCodeComponent,canActivate:[AuthGuard]
  },
  {
    path: 'withdrawl-account-list', component: WithdrawMyAccontComponent,canActivate:[AuthGuard]
  },
  {
    path: 'bet-history', component: BetHistoryPageComponent
  },
  {
    path: 'result', component: ResultComponent,canActivate:[AuthGuard]
  },
  {
    path: 'change-password', component: ChangePasswordComponent,canActivate:[AuthGuard]
  },
  {
    path: 'profile-edit', component: ProfileEditPageComponent,canActivate:[AuthGuard]
  },
  {
    path: 'default-otp', component: DefaultOptSettingComponent
  },

  {
    path: 'email-address', component: EmailAddressComponent,canActivate:[AuthGuard]
  },

  {
    path: 'email-otp-comfirm', component: EmailOtpConfirmComponent,canActivate:[AuthGuard]
  },

  {
    path: 'points-history', component: PointsHistoryComponent,canActivate:[AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
