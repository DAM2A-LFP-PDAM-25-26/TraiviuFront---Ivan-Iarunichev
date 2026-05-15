import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
  IonAvatar,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonPopover,
  AlertController,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { ListsService, TraiviuList } from '../../core/api/lists';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { addIcons } from 'ionicons';
import {
  pencilOutline,
  trashOutline,
  closeOutline,
  personCircleOutline, folderOpenOutline } from 'ionicons/icons';

@Component({
  selector: 'app-lists',
  templateUrl: 'lists.page.html',
  styleUrls: ['lists.page.scss'],
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
    IonAvatar,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonPopover,
  ],
})
export class ListsPage implements OnInit, OnDestroy {
  public lists: TraiviuList[] = [];
  public isLoading = true;
  public profileImageUrl: string | null = null;

  private avatarSub?: Subscription;

  constructor(
    private listsService: ListsService,
    private alertController: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    addIcons({personCircleOutline,folderOpenOutline,pencilOutline,trashOutline,closeOutline,});
  }

  ngOnInit() {
    this.avatarSub = this.authService.avatar$.subscribe((avatar) => {
      this.profileImageUrl = avatar;
    });

    this.loadLists();
  }

  ngOnDestroy() {
    this.avatarSub?.unsubscribe();
  }

  loadLists() {
    this.isLoading = true;

    this.listsService.getMyLists().subscribe({
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
      cssClass: 'custom-create-alert',
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
          cssClass: 'alert-confirm-btn',
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

  private createNewList(name: string) {
    this.isLoading = true;

    this.listsService.createList(name, 'CUSTOM').subscribe({
      next: (newList: TraiviuList) => {
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
            this.presentEditListAlert(list);
          },
        },
        {
          text: 'Eliminar lista',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.presentDeleteListAlert(list);
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

  async presentDeleteListAlert(list: TraiviuList) {
    const alert = await this.alertController.create({
      header: 'Eliminar lista',
      message: `¿Seguro que quieres eliminar "${list.name}"?`,
      cssClass: 'custom-delete-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-cancel-btn',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'alert-delete-btn',
          handler: () => {
            this.deleteList(list);
          },
        },
      ],
    });

    await alert.present();
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
      cssClass: 'custom-rename-alert',
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
          cssClass: 'alert-confirm-btn',
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

        const index = this.lists.findIndex((l) => l.id === listToUpdate.id);

        if (index !== -1) {
          this.lists[index].name = updatedList.name || newName;
          this.cdr.detectChanges();
        }

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al editar la lista en el backend:', err);
        this.loadLists();
      },
    });
  }

  goToSettings() {
    this.router.navigateByUrl('/tabs/settings');
  }

  goToHome() {
    this.router.navigateByUrl('/tabs/catalog');
  }
}
