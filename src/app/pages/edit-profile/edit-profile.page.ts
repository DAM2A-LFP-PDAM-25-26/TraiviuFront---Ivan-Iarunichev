import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../core/auth/auth.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
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
  ) {}

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
      this.authService.setAvatar(result);
    };
    reader.readAsDataURL(file);
  }

  clearAvatar() {
    this.previewImageUrl = null;
    this.authService.setAvatar(null);
  }

  async save() {
    if (this.profileForm.invalid || !this.currentUser) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const updated: AuthResponse = {
      ...this.currentUser,
      displayName: this.profileForm.value.displayName,
      email: this.profileForm.value.email,
    };

    this.authService.setUser(updated);

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
