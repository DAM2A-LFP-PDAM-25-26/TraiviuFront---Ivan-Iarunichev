import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ListsService, TraiviuList } from '../../core/api/lists';
import { ListItemService } from '../../services/list-item';

@Component({
  selector: 'app-select-list',
  templateUrl: './select-list.page.html',
  styleUrls: ['./select-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class SelectListPage implements OnInit {
  @Input() mediaData: any;

  listas: TraiviuList[] = [];
  loading = true;

  private testUserId = '4beac43a-2c09-4a20-9fdd-f6540b8c8e4d';

  constructor(
    private modalController: ModalController,
    private listsService: ListsService,
    private listItemService: ListItemService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cargarListas();
  }

  cargarListas() {
    this.loading = true;

    this.listsService.getListsByUser(this.testUserId).subscribe({
      next: (listas) => {
        this.listas = listas || [];
        this.loading = false;
      },
      error: (err) => {
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
      error: (err) => {
        console.error('Error al añadir a la lista', err);
      },
    });
  }

  cerrar() {
    this.modalController.dismiss();
  }
}
