import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SettingsPage implements OnInit, OnDestroy {
  displayName: string | null = null;
  email: string | null = null;
  profileImageUrl: string | null = null;

  clanNotificationsEnabled = true;
  soundEnabled = true;
  defaultProfileImage = 'assets/icon/default-avatar.png';

  private userSub?: Subscription;
  private avatarSub?: Subscription;
  private clanNotificationsSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    this.userSub = this.authService.user$.subscribe((user) => {
      this.displayName = user?.displayName ?? 'Usuario';
      this.email = user?.email ?? '';
    });

    this.avatarSub = this.authService.avatar$.subscribe((avatar) => {
      this.profileImageUrl = avatar || this.defaultProfileImage;
    });

    this.clanNotificationsSub =
      this.authService.clanNotificationsEnabled$.subscribe((enabled) => {
        this.clanNotificationsEnabled = enabled;
      });

    this.loadPreferences();
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
    this.avatarSub?.unsubscribe();
    this.clanNotificationsSub?.unsubscribe();
  }

  loadPreferences() {
    const sound = localStorage.getItem('pref_sound_enabled');

    if (sound !== null) {
      this.soundEnabled = sound === 'true';
    }
  }

  toggleClanNotifications(event: CustomEvent) {
    const enabled = !!event.detail.checked;
    this.authService.setClanNotificationsEnabled(enabled);
    this.clanNotificationsEnabled = enabled;
  }

  toggleSound(event: CustomEvent) {
    this.soundEnabled = !!event.detail.checked;
    localStorage.setItem('pref_sound_enabled', String(this.soundEnabled));
  }

  changeProfileImage() {
    this.router.navigateByUrl('/tabs/edit-profile');
  }

  removeProfileImage() {
    this.authService.clearAvatar();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Seguro que quieres cerrar sesión?',
      cssClass: 'custom-logout-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'logout-cancel-btn',
        },
        {
          text: 'Cerrar sesión',
          role: 'destructive',
          cssClass: 'logout-confirm-btn',
          handler: () => {
            this.authService.logout();
            this.router.navigateByUrl('/login', { replaceUrl: true });
          },
        },
      ],
    });

    await alert.present();
  }

  goToEditProfile() {
    this.router.navigateByUrl('/tabs/edit-profile');
  }

  goToHome() {
    this.router.navigateByUrl('/tabs/catalog');
  }
}
