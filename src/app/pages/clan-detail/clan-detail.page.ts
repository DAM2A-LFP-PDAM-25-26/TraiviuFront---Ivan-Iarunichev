import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AlertController,
  IonicModule,
  ToastController,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Clan, ClanActivityItem, ClanMessage } from '../../models/clan.model';
import { ClansService } from '../../services/clan';
import { AuthService } from '../../core/auth/auth.service';
import { MediaDetailPage } from '../media-detail/media-detail.page';

@Component({
  selector: 'app-clan-detail',
  templateUrl: './clan-detail.page.html',
  styleUrls: ['./clan-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ClanDetailPage implements OnInit, OnDestroy {
  clanId!: string;
  clan: Clan | null = null;

  activeTab: 'feed' | 'chat' = 'feed';

  loadingClan = true;
  loadingFeed = true;
  loadingChat = true;

  feedItems: ClanActivityItem[] = [];
  messages: ClanMessage[] = [];

  newMessage = '';

  profileImageUrl: string | null = null;
  clanNotificationsEnabled = true;

  clanMenuOpen = false;
  clanMenuEvent: Event | undefined;

  private avatarSub?: Subscription;
  private clanNotificationsSub?: Subscription;
  private readonly backendBaseUrl = 'http://localhost:8085';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clansService: ClansService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService,
    private modalController: ModalController,
  ) {}

  ngOnInit() {
    this.avatarSub = this.authService.avatar$.subscribe((avatar) => {
      this.profileImageUrl = avatar;
    });

    this.clanNotificationsSub =
      this.authService.clanNotificationsEnabled$.subscribe((enabled) => {
        this.clanNotificationsEnabled = enabled;
      });

    this.clanId = this.route.snapshot.paramMap.get('clanId') ?? '';
    console.log('ClanDetailPage clanId al iniciar:', this.clanId);

    if (!this.clanId) {
      this.router.navigateByUrl('/tabs/clans');
      return;
    }

    this.loadClan();
    this.loadFeed();
    this.loadChat();
  }

  ngOnDestroy() {
    this.avatarSub?.unsubscribe();
    this.clanNotificationsSub?.unsubscribe();
  }

  loadClan() {
    this.loadingClan = true;
    this.clansService.getClanById(this.clanId).subscribe({
      next: (clan) => {
        this.clan = clan;
        this.loadingClan = false;
      },
      error: async (err) => {
        console.error('Error cargando clan', err);
        this.loadingClan = false;
        await this.presentToast('No se pudo cargar el clan');
        this.router.navigateByUrl('/tabs/clans');
      },
    });
  }

  loadFeed(event?: any) {
    this.loadingFeed = true;
    this.clansService.getClanFeed(this.clanId).subscribe({
      next: (items) => {
        console.log('FEED ITEMS', items);
        this.feedItems = items || [];
        this.loadingFeed = false;
        event?.target?.complete?.();
      },
      error: async (err) => {
        console.error('Error cargando feed', err);
        this.loadingFeed = false;
        event?.target?.complete?.();
        await this.presentToast('No se pudo cargar la actividad reciente');
      },
    });
  }

  loadChat(event?: any) {
    this.loadingChat = true;
    this.clansService.getClanMessages(this.clanId).subscribe({
      next: (messages) => {
        this.messages = messages || [];
        this.loadingChat = false;
        event?.target?.complete?.();
      },
      error: async (err) => {
        console.error('Error cargando mensajes', err);
        this.loadingChat = false;
        event?.target?.complete?.();
        await this.presentToast('No se pudieron cargar los mensajes');
      },
    });
  }

  getFeedAvatarUrl(item: ClanActivityItem): string | null {
    const raw = item.userProfileImageUrl?.trim();
    if (!raw) return null;

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }

    if (raw.startsWith('/')) {
      return `${this.backendBaseUrl}${raw}`;
    }

    return `${this.backendBaseUrl}/${raw}`;
  }

  setTab(tab: 'feed' | 'chat') {
    this.activeTab = tab;
  }

  async toggleClanNotifications() {
    const newValue = !this.clanNotificationsEnabled;
    this.authService.setClanNotificationsEnabled(newValue);
    this.clanNotificationsEnabled = newValue;

    await this.presentToast(
      newValue
        ? 'Notificaciones del clan activadas'
        : 'Notificaciones del clan desactivadas',
    );

    this.closeClanMenu();
  }

  sendMessage() {
    const content = this.newMessage.trim();
    if (!content) {
      return;
    }

    this.loadingController
      .create({ message: 'Enviando mensaje...' })
      .then((loading) => {
        loading.present();

        this.clansService.sendMessage(this.clanId, content).subscribe({
          next: async (msg) => {
            await loading.dismiss();
            this.newMessage = '';
            this.messages = [...this.messages, msg];
          },
          error: async (err) => {
            console.error('Error enviando mensaje', err);
            await loading.dismiss();
            await this.presentToast('No se pudo enviar el mensaje');
          },
        });
      });
  }

  goBackToClans() {
    this.router.navigateByUrl('/tabs/clans');
  }

  goToSettings() {
    this.router.navigateByUrl('/tabs/settings');
  }

  goToHome() {
    this.router.navigateByUrl('/tabs/catalog');
  }

  openClanMenu(ev: Event) {
    this.clanMenuEvent = ev;
    this.clanMenuOpen = true;
  }

  closeClanMenu() {
    this.clanMenuOpen = false;
    this.clanMenuEvent = undefined;
  }

  trackByFeedId(index: number, item: ClanActivityItem) {
    return item.id;
  }

  trackByMessageId(index: number, item: ClanMessage) {
    return item.id;
  }

  async leaveClan() {
    const alert = await this.alertController.create({
      header: 'Salir del clan',
      message: '¿Seguro que quieres salir de este clan?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salir',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Saliendo del clan...',
            });
            await loading.present();

            this.clansService.leaveClan(this.clanId).subscribe({
              next: async () => {
                await loading.dismiss();
                this.closeClanMenu();
                await this.presentToast('Has salido del clan');
                this.router.navigateByUrl('/tabs/clans');
              },
              error: async (err) => {
                console.error('Error saliendo del clan', err);
                await loading.dismiss();
                await this.presentToast(
                  err?.error?.message || 'No se pudo salir del clan',
                );
              },
            });
          },
        },
      ],
    });

    await alert.present();
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

  async abrirDetalleMedia(item: any) {
    if (!item?.tmdbId || !item?.mediaType) {
      console.log('No se abre modal: item sin tmdbId o mediaType', item);
      return;
    }

    const mediaType =
      String(item.mediaType).toLowerCase() === 'tv' ? 'tv' : 'movie';

    const modal = await this.modalController.create({
      component: MediaDetailPage,
      componentProps: {
        tmdbId: item.tmdbId,
        mediaType,
        clanId: this.clanId,
      },
      cssClass: 'media-detail-modal',
    });

    await modal.present();
  }
}
