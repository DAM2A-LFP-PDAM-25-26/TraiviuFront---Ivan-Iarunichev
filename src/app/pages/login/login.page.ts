import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonIcon,
  AlertController,
  Platform,
} from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonIcon,
  ],
})
export class LoginPage implements OnInit {
  mode: 'login' | 'register' = 'login';
  isSubmitting = false;

  authForm = this.fb.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.setMode('login');

    if (this.authService.isLoggedIn()) {
      const target = this.authService.isAdmin()
        ? AuthService.ADMIN_ROUTE
        : AuthService.HOME_ROUTE;

      this.router.navigateByUrl(target, { replaceUrl: true });
    }
  }

  setMode(mode: 'login' | 'register') {
    this.mode = mode;

    const displayNameControl = this.authForm.get('displayName');

    if (mode === 'register') {
      displayNameControl?.setValidators([
        Validators.required,
        Validators.minLength(2),
      ]);
    } else {
      displayNameControl?.clearValidators();
      displayNameControl?.setValue('');
      displayNameControl?.setErrors(null);
    }

    displayNameControl?.updateValueAndValidity();
    this.authForm.updateValueAndValidity();
  }

  async submit() {
    if (this.isSubmitting) {
      return;
    }

    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const email = this.authForm.value.email ?? '';
    const password = this.authForm.value.password ?? '';
    const displayName = this.authForm.value.displayName ?? '';

    const request$ =
      this.mode === 'login'
        ? this.authService.login(email, password)
        : this.authService.register(email, password, displayName);

    request$.subscribe({
      next: async () => {
        this.isSubmitting = false;

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const currentUser = this.authService.getCurrentUser();
        const defaultUrl =
          currentUser?.role === 'ADMIN'
            ? AuthService.ADMIN_ROUTE
            : AuthService.HOME_ROUTE;

        await this.router.navigateByUrl(returnUrl || defaultUrl, {
          replaceUrl: true,
        });
      },
      error: async (err) => {
        this.isSubmitting = false;

        const alert = await this.alertController.create({
          header:
            this.mode === 'login' ? 'Error de acceso' : 'Error de registro',
          message:
            err?.error?.message ||
            err?.error?.error ||
            (this.mode === 'login'
              ? 'No se pudo iniciar sesión. Revisa tus credenciales.'
              : 'No se pudo crear la cuenta.'),
          cssClass: 'custom-error-alert',
          buttons: [
            {
              text: 'OK',
              cssClass: 'error-alert-btn',
            },
          ],
        });

        await alert.present();
      },
    });
  }

  get displayName() {
    return this.authForm.get('displayName');
  }

  get email() {
    return this.authForm.get('email');
  }

  get password() {
    return this.authForm.get('password');
  }
}
