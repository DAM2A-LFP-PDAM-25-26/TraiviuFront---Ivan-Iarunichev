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
  IonLabel,
} from '@ionic/angular/standalone';
import { TmdbService } from '../../services/tmdb';
import { MediaDetailPage } from '../../pages/media-detail/media-detail.page';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon
],
})
export class CatalogPage implements OnInit, OnDestroy {
  trendingItems: any[] = [];
  releaseItems: any[] = [];
  mustWatchItems: any[] = [];

  loadingTrending = true;
  loadingReleases = true;
  loadingMustWatch = true;

  profileImageUrl: string | null = null;

  private avatarSub?: Subscription;

  constructor(
    private tmdbService: TmdbService,
    private modalController: ModalController,
    private router: Router,
    private authService: AuthService,
  ) {
    addIcons({ personCircleOutline });
  }

  ngOnInit() {
    this.avatarSub = this.authService.avatar$.subscribe((avatar) => {
      this.profileImageUrl = avatar;
    });

    this.loadTrending();
    this.loadReleases();
    this.loadMustWatch();
  }

  ngOnDestroy() {
    this.avatarSub?.unsubscribe();
  }

  loadTrending() {
    this.loadingTrending = true;

    this.tmdbService.getTrendingAll().subscribe({
      next: (resp) => {
        this.trendingItems = (resp.results || [])
          .slice(0, 10)
          .map((item: any) => ({
            id: item.id,
            title: item.title || item.name || 'Sin título',
            year: (item.release_date || item.first_air_date || '').substring(
              0,
              4,
            ),
            posterUrl: this.tmdbService.getPosterUrl(item.poster_path),
            mediaType: item.media_type || (item.title ? 'movie' : 'tv'),
          }));
        this.loadingTrending = false;
      },
      error: (err) => {
        console.error('Error cargando tendencias', err);
        this.loadingTrending = false;
      },
    });
  }

  loadReleases() {
    this.loadingReleases = true;

    this.tmdbService.getNowPlayingMovies().subscribe({
      next: (resp) => {
        this.releaseItems = (resp.results || [])
          .slice(0, 10)
          .map((item: any) => ({
            id: item.id,
            title: item.title || item.name || 'Sin título',
            year: (item.release_date || item.first_air_date || '').substring(
              0,
              4,
            ),
            posterUrl: this.tmdbService.getPosterUrl(item.poster_path),
            mediaType: 'movie',
          }));
        this.loadingReleases = false;
      },
      error: (err) => {
        console.error('Error cargando estrenos', err);
        this.loadingReleases = false;
      },
    });
  }

  loadMustWatch() {
    this.loadingMustWatch = true;

    this.tmdbService.getTopRatedMovies().subscribe({
      next: (resp) => {
        this.mustWatchItems = (resp.results || [])
          .slice(0, 10)
          .map((item: any) => ({
            id: item.id,
            title: item.title || item.name || 'Sin título',
            year: (item.release_date || item.first_air_date || '').substring(
              0,
              4,
            ),
            posterUrl: this.tmdbService.getPosterUrl(item.poster_path),
            mediaType: 'movie',
          }));
        this.loadingMustWatch = false;
      },
      error: (err) => {
        console.error('Error cargando imperdibles', err);
        this.loadingMustWatch = false;
      },
    });
  }

  goToSettings() {
    this.router.navigateByUrl('/tabs/settings');
  }

  scrollRow(container: HTMLElement, direction: 'left' | 'right') {
    const amount = 320;

    container.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  async abrirDetalle(item: any) {
    const modal = await this.modalController.create({
      component: MediaDetailPage,
      componentProps: {
        tmdbId: item.id,
        mediaType: item.mediaType || 'movie',
      },
      cssClass: 'media-detail-modal',
      presentingElement: await this.modalController.getTop(),
    });

    await modal.present();
  }

  goToHome() {
    this.router.navigateByUrl('/tabs/catalog');
  }
}
