import { Component, OnInit } from '@angular/core';
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
  IonInput,
  IonAvatar,
  AlertController,
} from '@ionic/angular/standalone';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../core/auth/auth.service';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonAvatar,
  ],
})
export class EditProfilePage implements OnInit {
  profileForm!: FormGroup;
  previewImageUrl: string | null = null;
  currentUser: AuthResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
  ) {
    addIcons({ personCircleOutline });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    this.profileForm = this.fb.group({
      displayName: [
        this.currentUser?.displayName ?? '',
        [Validators.required, Validators.minLength(2)],
      ],
      email: [
        this.currentUser?.email ?? '',
        [Validators.required, Validators.email],
      ],
    });

    this.previewImageUrl = this.authService.getStoredAvatar();
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.previewImageUrl = result;
    };
    reader.readAsDataURL(file);

    this.authService.uploadAvatar(file).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Error subiendo avatar', err);
      },
    });
  }

  clearAvatar() {
    this.previewImageUrl = null;

    this.authService.removeAvatarBackend().subscribe({
      next: () => {},
      error: (err) => {
        console.error('Error eliminando avatar', err);
      },
    });
  }

  async save() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const displayName = this.profileForm.value.displayName;
    const email = this.profileForm.value.email;

    this.authService.updateMe(displayName, email).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Perfil actualizado',
          message: 'Tus datos se han guardado correctamente.',
          cssClass: 'custom-success-alert',
          buttons: [
            {
              text: 'OK',
              cssClass: 'success-alert-btn',
            },
          ],
        });

        await alert.present();
        this.router.navigateByUrl('/tabs/settings');
      },
      error: async (err) => {
        console.error('Error actualizando perfil', err);

        const alert = await this.alertController.create({
          header: 'Error',
          message: err?.error?.message || 'No se pudo actualizar el perfil.',
          buttons: ['OK'],
        });

        await alert.present();
      },
    });
  }

  goBack() {
    this.router.navigateByUrl('/tabs/settings');
  }

  goToHome() {
    this.router.navigateByUrl('/tabs/catalog');
  }

  get displayName() {
    return this.profileForm.get('displayName');
  }

  get email() {
    return this.profileForm.get('email');
  }
}
