import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonLabel,
  IonSpinner,
  IonChip,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { TmdbService } from '../../services/tmdb';
import { SafeUrlPipe } from '../../pipes/safe-url-pipe';
import { SelectListPage } from '../select-list/select-list.page';
import { ClansService } from '../../services/clan';
import { SelectClanPage } from '../select-clan/select-clan.page';

@Component({
  selector: 'app-media-detail',
  templateUrl: './media-detail.page.html',
  styleUrls: ['./media-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SafeUrlPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonLabel,
    IonSpinner,
    IonChip,
    IonBadge,
    IonSegment,
    IonSegmentButton,
  ],
})
export class MediaDetailPage implements OnInit {
  @Input() tmdbId!: number;
  @Input() mediaType: 'movie' | 'tv' = 'movie';
  @Input() clanId: string | null = null;

  loading = true;
  canRecommendToClan = false;
  detail: any = null;
  trailerUrl: string | null = null;
  estadoUsuario = 'pendiente';
  trailerKey: string | null = null;

  constructor(
    private modalController: ModalController,
    private tmdbService: TmdbService,
    private clanService: ClansService,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
    console.log('MediaDetailPage tmdbId:', this.tmdbId);
    console.log('MediaDetailPage mediaType:', this.mediaType);
    console.log('MediaDetailPage clanId:', this.clanId);

    this.canRecommendToClan = !!this.clanId && this.clanId.trim().length > 0;
    this.cargarDetalle();
  }

  cargarDetalle() {
    this.loading = true;

    const request =
      this.mediaType === 'tv'
        ? this.tmdbService.getTvDetails(this.tmdbId)
        : this.tmdbService.getMovieDetails(this.tmdbId);

    request.subscribe({
      next: (resp: any) => {
        this.detail = resp;
        this.loading = false;
        this.cargarTrailer();
      },
      error: (err: any) => {
        console.error('Error cargando detalle', err);
        this.loading = false;
      },
    });
  }

  cargarTrailer() {
    const request =
      this.mediaType === 'tv'
        ? this.tmdbService.getTvVideos(this.tmdbId)
        : this.tmdbService.getMovieVideos(this.tmdbId);

    request.subscribe({
      next: (resp: any) => {
        const trailer = (resp.results || []).find(
          (video: any) =>
            video.site === 'YouTube' &&
            (video.type === 'Trailer' || video.type === 'Teaser'),
        );
        this.trailerKey = trailer ? trailer.key : null;
      },
      error: (err: any) => {
        console.error('Error cargando trailer', err);
      },
    });
  }

  get trailerEmbedUrl(): string | null {
    return this.trailerKey
      ? `https://www.youtube.com/embed/${this.trailerKey}`
      : null;
  }

  cerrar() {
    this.modalController.dismiss();
  }

  getPoster(path: string | null): string {
    return this.tmdbService.getPosterUrl(path);
  }

  getTitle(): string {
    return this.detail?.title || this.detail?.name || 'Sin título';
  }

  getYear(): string {
    return (
      this.detail?.release_date ||
      this.detail?.first_air_date ||
      ''
    ).substring(0, 4);
  }

  getGenres(): string {
    return (this.detail?.genres || []).map((g: any) => g.name).join(', ');
  }

  getRating(): string {
    return this.detail?.vote_average
      ? this.detail.vote_average.toFixed(1)
      : '—';
  }

  getDuration(): string {
    if (this.mediaType === 'movie') {
      const minutes = this.detail?.runtime;
      if (!minutes) return '—';
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m}min`;
    }

    if (this.mediaType === 'tv') {
      const episodeRuntime = this.detail?.episode_run_time?.[0];
      const seasons = this.detail?.number_of_seasons;
      if (seasons && episodeRuntime) {
        return `${seasons} temp · ${episodeRuntime} min`;
      }
      if (seasons) {
        return `${seasons} temp`;
      }
    }

    return '—';
  }

  async anadirALista() {
    const mediaData = {
      externalApiId: this.tmdbId.toString(),
      title: this.getTitle(),
      year: this.getYear(),
      posterUrl: this.getPoster(this.detail?.poster_path),
      mediaType: this.mediaType,
    };

    const modal = await this.modalController.create({
      component: SelectListPage,
      componentProps: {
        mediaData,
      },
      cssClass: 'select-list-modal',
    });

    await modal.present();
  }

  async recomendarAlClan() {
    if (!this.canRecommendToClan || !this.clanId) {
      console.warn('No hay clanId definido para recomendar');
      return;
    }

    const payload = {
      externalApiId: this.tmdbId.toString(),
      title: this.getTitle(),
      year: this.getYear(),
      posterUrl: this.getPoster(this.detail?.poster_path),
      mediaType: this.mediaType,
    };

    this.clanService.recommendToClan(this.clanId, payload).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Recomendación enviada al clan',
          duration: 1800,
          color: 'success',
        });
        await toast.present();
        this.cerrar();
      },
      error: async (err) => {
        console.error('Error recomendando al clan', err);
        const toast = await this.toastController.create({
          message: 'No se pudo recomendar al clan',
          duration: 1800,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }

  async recomendar() {
    if (this.clanId) {
      this.recomendarAlClan();
      return;
    }

    const mediaData = {
      externalApiId: this.tmdbId.toString(),
      title: this.getTitle(),
      year: this.getYear(),
      posterUrl: this.getPoster(this.detail?.poster_path),
      mediaType: this.mediaType,
    };

    const modal = await this.modalController.create({
      component: SelectClanPage,
      componentProps: {
        mediaData,
      },
      cssClass: 'select-list-modal',
    });

    await modal.present();
  }

  abrirTrailer() {
    if (this.trailerUrl) {
      window.open(this.trailerUrl, '_blank');
    }
  }
}
