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
import { ListsService, TraiviuList } from '../../core/api/lists';
import { ListItemService } from '../../services/list-item';

@Component({
  selector: 'app-select-list',
  templateUrl: './select-list.page.html',
  styleUrls: ['./select-list.page.scss'],
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
export class SelectListPage implements OnInit {
  @Input() mediaData: any;

  listas: TraiviuList[] = [];
  loading = true;

  constructor(
    private modalController: ModalController,
    private listsService: ListsService,
    private listItemService: ListItemService,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
    this.cargarListas();
  }

  cargarListas() {
    this.loading = true;

    this.listsService.getMyLists().subscribe({
      next: (listas: TraiviuList[]) => {
        this.listas = listas || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar listas', err);
        this.loading = false;
      },
    });
  }

  async seleccionarLista(lista: TraiviuList) {
    const payload = {
      listId: lista.id,
      externalApiId: this.mediaData.externalApiId,
      title: this.mediaData.title,
      year: this.mediaData.year,
      posterUrl: this.mediaData.posterUrl,
      mediaType: this.mediaData.mediaType,
    };

    this.listItemService.addMovieToList(payload).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: `Añadido a "${lista.name}"`,
          duration: 1500,
          position: 'bottom',
        });
        await toast.present();
        this.modalController.dismiss({ added: true });
      },
      error: (err: any) => {
        console.error('Error al añadir a la lista', err);
      },
    });
  }

  cerrar() {
    this.modalController.dismiss();
  }
}
