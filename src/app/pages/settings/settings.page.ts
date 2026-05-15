import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonToggle,
  IonAvatar,
  AlertController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonToggle,
    IonAvatar,
  ],
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
    private alertController: AlertController
  ) {
    addIcons({ personCircleOutline });
  }

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
    this.router.navigateByUrl('/edit-profile');
  }

  async removeProfileImage() {
    const alert = await this.alertController.create({
      header: 'Quitar foto de perfil',
      message: '¿Seguro que quieres eliminar tu foto de perfil?',
      cssClass: 'custom-logout-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'logout-cancel-btn',
        },
        {
          text: 'Quitar',
          role: 'destructive',
          cssClass: 'logout-confirm-btn',
          handler: () => {
            this.authService.removeAvatarBackend().subscribe({
              next: () => {
                this.profileImageUrl = this.defaultProfileImage;
              },
              error: (err) => {
                console.error('Error al quitar avatar:', err);
              },
            });
          },
        },
      ],
    });

    await alert.present();
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
    this.router.navigateByUrl('/edit-profile');
  }

  goToHome() {
    this.router.navigateByUrl('/tabs/catalog');
  }
}
