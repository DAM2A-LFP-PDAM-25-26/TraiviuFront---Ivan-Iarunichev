import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  AlertController,
  ActionSheetController,
} from '@ionic/angular';
import { ListsService, TraiviuList } from '../../core/api/lists';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lists',
  templateUrl: 'lists.page.html',
  styleUrls: ['lists.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class ListsPage implements OnInit {
  public lists: TraiviuList[] = [];
  public isLoading = true;

  private testUserId = '4beac43a-2c09-4a20-9fdd-f6540b8c8e4d';

  constructor(
    private listsService: ListsService,
    private alertController: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLists();
  }

  loadLists() {
    this.isLoading = true;
    this.listsService.getListsByUser(this.testUserId).subscribe({
      next: (data: TraiviuList[]) => {
        this.lists = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar las listas:', err);
        this.isLoading = false;
      },
    });
  }

  async presentCreateListAlert() {
    const alert = await this.alertController.create({
      header: 'Nueva Lista',
      message: 'Dale un nombre a tu nueva lista',
      cssClass: 'traiviu-custom-alert',
      inputs: [
        {
          name: 'listName',
          type: 'text',
          placeholder: 'Ej. Favoritos',
          attributes: {
            maxlength: 30,
          },
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-cancel-btn',
        },
        {
          text: 'Crear',
          cssClass: 'alert-create-btn',
          handler: (data: any) => {
            if (data.listName && data.listName.trim() !== '') {
              this.createNewList(data.listName.trim());
            }
          },
        },
      ],
    });

    await alert.present();
  }

  // Llama al backend
  private createNewList(name: string) {
    this.isLoading = true;

    this.listsService.createList(this.testUserId, name, 'CUSTOM').subscribe({
      next: (newList: any) => {
        console.log('¡Lista creada en el backend!', newList);
        this.isLoading = false;
        this.loadLists();
      },

      error: (err: any) => {
        console.error('Error en la petición de crear lista:', err);
        this.isLoading = false;
        this.loadLists();
      },
    });
  }
  goToListDetails(list: TraiviuList) {
    console.log('Navegando a los detalles de la lista:', list.name);

    this.router.navigate(['/tabs/lists', list.id]);
  }

  async openListOptions(event: Event, list: TraiviuList) {
    event.stopPropagation();

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Opciones de "${list.name}"`,
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Cambiar nombre',
          icon: 'pencil-outline',
          handler: () => {
            console.log('Cambiar nombre clicked');
            this.presentEditListAlert(list);
          },
        },
        {
          text: 'Eliminar lista',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            console.log('Eliminar lista clicked');
            this.deleteList(list);
          },
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  deleteList(list: TraiviuList) {
    this.isLoading = true;

    this.listsService.deleteList(list.id).subscribe({
      next: () => {
        console.log(`Lista ${list.name} eliminada con éxito del backend`);

        this.lists = this.lists.filter((l) => l.id !== list.id);

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al borrar la lista en el backend:', err);

        this.loadLists();
      },
    });
  }

  async presentEditListAlert(list: TraiviuList) {
    const alert = await this.alertController.create({
      header: 'Editar Lista',
      message: 'Cambia el nombre de tu lista',
      cssClass: 'traiviu-custom-alert',
      inputs: [
        {
          name: 'newName',
          type: 'text',
          value: list.name,
          placeholder: 'Nuevo nombre',
          attributes: { maxlength: 30 },
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-cancel-btn',
        },
        {
          text: 'Guardar',
          cssClass: 'alert-create-btn',
          handler: (data: any) => {
            const newName = data.newName?.trim();

            if (newName && newName !== '' && newName !== list.name) {
              this.updateList(list, newName);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  private updateList(listToUpdate: TraiviuList, newName: string) {
    this.isLoading = true;

    this.listsService.updateListName(listToUpdate.id, newName).subscribe({
      next: (updatedList: TraiviuList) => {
        console.log('Lista actualizada en la base de datos:', updatedList);

        const index = this.lists.findIndex(l => l.id === listToUpdate.id);

        if (index !== -1) {
          this.lists[index].name = updatedList.name || newName;
          this.cdr.detectChanges();
        }

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al editar la lista en el backend:', err);
        this.loadLists();
      }
    });
  }
}
