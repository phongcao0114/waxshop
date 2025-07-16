import { NgModule } from '@angular/core';
import { UserProfileComponent } from './user-profile/user-profile.component';

@NgModule({
  imports: [UserProfileComponent],
  exports: [UserProfileComponent]
})
export class UserModule {}

