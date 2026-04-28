import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertController,
  IonicModule,
  LoadingController,
} from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
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
    private loadingController: LoadingController,
  ) {}

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
    }

    displayNameControl?.updateValueAndValidity();
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/tabs/catalog', { replaceUrl: true });
    }
  }

  async submit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingController.create({
      message:
        this.mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...',
      spinner: 'crescent',
      cssClass: 'custom-auth-loading',
      backdropDismiss: false,
    });

    await loading.present();
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
        await loading.dismiss();
        this.isSubmitting = false;

        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') || '/tabs/catalog';

        this.router.navigateByUrl(returnUrl, { replaceUrl: true });
      },
      error: async (err) => {
        await loading.dismiss();
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
