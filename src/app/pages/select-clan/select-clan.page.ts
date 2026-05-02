import { Component, Input, OnInit } from '@angular/core';
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
  IonSpinner,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { ClansService } from '../../services/clan';
import { Clan } from '../../models/clan.model';

@Component({
  selector: 'app-select-clan',
  templateUrl: './select-clan.page.html',
  styleUrls: ['./select-clan.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonSpinner,
  ],
})
export class SelectClanPage implements OnInit {
  @Input() mediaData: any;

  clanes: Clan[] = [];
  loading = true;

  constructor(
    private modalController: ModalController,
    private clansService: ClansService,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
    this.cargarClanes();
  }

  cargarClanes() {
    this.loading = true;

    this.clansService.getMyClans().subscribe({
      next: (clanes: Clan[]) => {
        this.clanes = clanes || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar clanes', err);
        this.loading = false;
      },
    });
  }

  async seleccionarClan(clan: Clan) {
    const payload = {
      externalApiId: this.mediaData.externalApiId,
      title: this.mediaData.title,
      year: this.mediaData.year,
      posterUrl: this.mediaData.posterUrl,
      mediaType: this.mediaData.mediaType,
    };

    this.clansService.recommendToClan(clan.id, payload).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: `Recomendado en "${clan.name}"`,
          duration: 1500,
          position: 'bottom',
          color: 'success',
        });
        await toast.present();
        this.modalController.dismiss({ recommended: true });
      },
      error: async (err: any) => {
        console.error('Error al recomendar al clan', err);
        const toast = await this.toastController.create({
          message: 'No se pudo recomendar al clan',
          duration: 1500,
          position: 'bottom',
          color: 'danger',
        });
        await toast.present();
      },
    });
  }

  cerrar() {
    this.modalController.dismiss();
  }
}
