import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSearchbar,
  IonAvatar,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonPopover,
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClansService } from '../../services/clan';
import { Clan } from '../../models/clan.model';
import { AuthService } from '../../core/auth/auth.service';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-clans',
  templateUrl: './clans.page.html',
  styleUrls: ['./clans.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSearchbar,
    IonAvatar,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonPopover,
  ],
})
export class ClansPage implements OnInit, OnDestroy {
  myClans: Clan[] = [];
  filteredClans: Clan[] = [];

  loading = true;
  searchTerm = '';

  profileImageUrl: string | null = null;
  private avatarSub?: Subscription;

  constructor(
    private clansService: ClansService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router,
    private authService: AuthService,
  ) {
    addIcons({ personCircleOutline });
  }

  ngOnInit() {
    this.avatarSub = this.authService.avatar$.subscribe((avatar) => {
      this.profileImageUrl = avatar;
    });

    this.loadMyClans();
  }

  ngOnDestroy() {
    this.avatarSub?.unsubscribe();
  }

  loadMyClans(event?: any) {
    this.loading = true;

    this.clansService.getMyClans().subscribe({
      next: (clans) => {
        this.myClans = clans || [];
        this.applyFilter();
        this.loading = false;
        event?.target?.complete?.();
      },
      error: async (error) => {
        console.error('Error cargando clanes', error);
        this.loading = false;
        event?.target?.complete?.();
        await this.presentToast('No se pudieron cargar los clanes');
      },
    });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredClans = [...this.myClans];
      return;
    }

    this.filteredClans = this.myClans.filter((clan) => {
      const name = clan.name?.toLowerCase() || '';
      const description = clan.description?.toLowerCase() || '';
      const code = clan.inviteCode?.toLowerCase() || '';

      return (
        name.includes(term) ||
        description.includes(term) ||
        code.includes(term)
      );
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail?.value || '';
    this.applyFilter();
  }

  async openCreateClanPrompt() {
    const alert = await this.alertController.create({
      header: 'Crear clan',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre del clan',
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Descripción',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Crear',
          handler: async (data) => {
            const name = (data?.name || '').trim();
            const description = (data?.description || '').trim();

            if (!name || !description) {
              await this.presentToast('Completa nombre y descripción');
              return false;
            }

            await this.createClan(name, description);
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async createClan(name: string, description: string) {
    const loading = await this.loadingController.create({
      message: 'Creando clan...',
    });
    await loading.present();

    this.clansService.createClan({ name, description }).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.presentToast('Clan creado correctamente');
        this.loadMyClans();
      },
      error: async (error) => {
        console.error('Error creando clan', error);
        await loading.dismiss();
        await this.presentToast(
          error?.error?.message || 'No se pudo crear el clan',
        );
      },
    });
  }

  async openJoinClanPrompt() {
    const alert = await this.alertController.create({
      header: 'Unirse a un clan',
      inputs: [
        {
          name: 'inviteCode',
          type: 'text',
          placeholder: 'Código de invitación',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Unirse',
          handler: async (data) => {
            const inviteCode = (data?.inviteCode || '').trim();

            if (!inviteCode) {
              await this.presentToast('Introduce un código');
              return false;
            }

            await this.joinClan(inviteCode);
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async joinClan(inviteCode: string) {
    const loading = await this.loadingController.create({
      message: 'Uniéndote al clan...',
    });
    await loading.present();

    this.clansService.joinClan({ inviteCode }).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.presentToast('Te has unido al clan');
        this.loadMyClans();
      },
      error: async (error) => {
        console.error('Error uniéndose al clan', error);
        await loading.dismiss();
        await this.presentToast(
          error?.error?.message || 'No se pudo unir al clan',
        );
      },
    });
  }

  async confirmLeaveClan(clan: Clan) {
    const alert = await this.alertController.create({
      header: 'Salir del clan',
      message: `¿Quieres salir de "${clan.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salir',
          role: 'destructive',
          handler: async () => {
            await this.leaveClan(clan.id);
          },
        },
      ],
    });

    await alert.present();
  }

  async leaveClan(clanId: string) {
    const loading = await this.loadingController.create({
      message: 'Saliendo del clan...',
    });
    await loading.present();

    this.clansService.leaveClan(clanId).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.presentToast('Has salido del clan');
        this.loadMyClans();
      },
      error: async (error) => {
        console.error('Error saliendo del clan', error);
        await loading.dismiss();
        await this.presentToast(
          error?.error?.message || 'No se pudo salir del clan',
        );
      },
    });
  }

  trackByClanId(index: number, clan: Clan) {
    return clan.id;
  }

  goToSettings() {
    this.router.navigateByUrl('/tabs/settings');
  }

  goToHome() {
    this.router.navigateByUrl('/tabs/catalog');
  }

  goToClanDetails(clan: Clan) {
    this.router.navigateByUrl(`/tabs/clans/${clan.id}`);
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'bottom',
      color: 'dark',
    });

    await toast.present();
  }
}
