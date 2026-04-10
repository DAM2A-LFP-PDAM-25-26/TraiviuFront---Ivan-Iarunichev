import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { TmdbService } from '../../services/tmdb';
import { SafeUrlPipe } from '../../pipes/safe-url-pipe';

@Component({
  selector: 'app-media-detail',
  templateUrl: './media-detail.page.html',
  styleUrls: ['./media-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SafeUrlPipe],
})
export class MediaDetailPage implements OnInit {
  @Input() tmdbId!: number;
  @Input() mediaType: 'movie' | 'tv' = 'movie';

  loading = true;
  detail: any = null;
  trailerUrl: string | null = null;

  estadoUsuario: string = 'pendiente';

  constructor(
    private modalController: ModalController,
    private tmdbService: TmdbService,
  ) {}

  ngOnInit() {
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

  trailerKey: string | null = null;

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

  anadirALista() {
    console.log('Abrir diálogo para añadir a lista');
  }

  recomendarAlClan() {
    console.log('Recomendar al clan');
  }

  abrirTrailer() {
    if (this.trailerUrl) {
      window.open(this.trailerUrl, '_blank');
    }
  }
}
