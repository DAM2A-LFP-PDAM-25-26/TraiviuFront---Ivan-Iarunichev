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
  IonItem,
  IonLabel,
  IonList,
  IonAvatar,
  IonTextarea,
  IonSegment,
  IonSegmentButton,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonPopover,
  IonInput,
  AlertController,
  ToastController,
  LoadingController,
  ModalController,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Clan, ClanActivityItem, ClanMessage } from '../../models/clan.model';
import { ClansService } from '../../services/clan';
import { AuthService } from '../../core/auth/auth.service';
import { MediaDetailPage } from '../media-detail/media-detail.page';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-clan-detail',
  templateUrl: './clan-detail.page.html',
  styleUrls: ['./clan-detail.page.scss'],
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
    IonItem,
    IonLabel,
    IonList,
    IonAvatar,
    IonTextarea,
    IonSegment,
    IonSegmentButton,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonPopover,
    IonInput,
  ],
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
  private chatPollIntervalId: any;
  private readonly backendBaseUrl = 'https://ivani26.iesmontenaranco.com:8000';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clansService: ClansService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService,
    private modalController: ModalController,
  ) {
    addIcons({ personCircleOutline });
  }

  ngOnInit() {
    this.avatarSub = this.authService.avatar$.subscribe((avatar) => {
      this.profileImageUrl = avatar;
    });

    this.clanNotificationsSub =
      this.authService.clanNotificationsEnabled$.subscribe((enabled) => {
        this.clanNotificationsEnabled = enabled;
      });

    this.clanId = this.route.snapshot.paramMap.get('clanId') ?? '';

    if (!this.clanId) {
      this.router.navigateByUrl('/tabs/clans');
      return;
    }

    this.loadClan();
    this.loadFeed();
    this.loadChat(true);

    this.chatPollIntervalId = setInterval(() => {
      if (this.activeTab === 'chat') {
        this.loadChat(false);
      }
    }, 5000);
  }

  ngOnDestroy() {
    this.avatarSub?.unsubscribe();
    this.clanNotificationsSub?.unsubscribe();

    if (this.chatPollIntervalId) {
      clearInterval(this.chatPollIntervalId);
    }
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

  loadChat(showLoader = false, event?: any) {
    if (showLoader) {
      this.loadingChat = true;
    }

    this.clansService.getClanMessages(this.clanId).subscribe({
      next: (messages) => {
        const incoming = messages || [];

        if (incoming.length !== this.messages.length) {
          this.messages = incoming;
        } else {
          const currentLastId = this.messages[this.messages.length - 1]?.id;
          const incomingLastId = incoming[incoming.length - 1]?.id;

          if (currentLastId !== incomingLastId) {
            this.messages = incoming;
          }
        }

        this.loadingChat = false;
        event?.target?.complete?.();
      },
      error: async (err) => {
        console.error('Error cargando mensajes', err);
        this.loadingChat = false;
        event?.target?.complete?.();

        if (showLoader) {
          await this.presentToast('No se pudieron cargar los mensajes');
        }
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

  getChatAvatarUrl(message: ClanMessage): string | null {
    const raw = message.avatarUrl?.trim();
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

    if (tab === 'chat') {
      this.loadChat(false);
    }
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

    this.clansService.sendMessage(this.clanId, content).subscribe({
      next: (msg) => {
        this.newMessage = '';
        this.messages = [...this.messages, msg];
      },
      error: async (err) => {
        console.error('Error enviando mensaje', err);
        await this.presentToast('No se pudo enviar el mensaje');
      },
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

    modal.onDidDismiss().then((result) => {
      const data = result.data;
      if (data?.action === 'recommended') {
        this.loadFeed();
      }
    });

    await modal.present();
  }
}
