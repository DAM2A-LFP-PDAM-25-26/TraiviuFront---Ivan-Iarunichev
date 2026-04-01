import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ActionSheetController } from '@ionic/angular';
import { ListsService, TraiviuList } from '../../core/api/lists';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lists',
  templateUrl: 'lists.page.html',
  styleUrls: ['lists.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ListsPage implements OnInit {
  public lists: TraiviuList[] = [];
  public isLoading = true;

  private testUserId = '4beac43a-2c09-4a20-9fdd-f6540b8c8e4d';

  constructor(private listsService: ListsService, private alertController: AlertController, private actionSheetCtrl: ActionSheetController, private router: Router){}

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
      }
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
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-cancel-btn'
        },
        {
          text: 'Crear',
          cssClass: 'alert-create-btn',
          handler: (data: any) => { 
            if (data.listName && data.listName.trim() !== '') {
              this.createNewList(data.listName.trim());
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Llama al backend
    private createNewList(name: string) {
    this.isLoading = true;

    this.listsService.createList(this.testUserId, name, 'CUSTOM').subscribe({
      next: (newList: any) => { 
        console.log("¡Lista creada en el backend!", newList);
        this.isLoading = false; 
        this.loadLists(); 
      },

      error: (err: any) => {
        console.error('Error en la petición de crear lista:', err);
        this.isLoading = false; 
        this.loadLists(); 
      }
    });
  }
  goToListDetails(list: TraiviuList) {
    console.log('Navegando a la lista:', list.name);
    // Aquí pondremos la ruta real a la que quieres ir, por ejemplo:
    // this.router.navigate(['/tabs/lists', list.id]);
  }

  // --- NUEVA FUNCIÓN: Menú de opciones (3 puntitos) ---
  async openListOptions(event: Event, list: TraiviuList) {
    event.stopPropagation(); 

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Opciones de "${list.name}"`,
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Editar nombre',
          icon: 'pencil-outline',
          handler: () => {
            console.log('Editar lista clicked');
            // Aquí llamaremos a una función para editar
            this.presentEditListAlert(list);
          }
        },
        {
          text: 'Eliminar lista',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            console.log('Eliminar lista clicked');
            // Aquí llamaremos al backend para borrar
            this.deleteList(list);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  deleteList(list: TraiviuList) {
    console.log('Falta conectar borrar lista con Spring Boot', list.id);
    // this.listsService.deleteList(list.id).subscribe(...)
  }

  presentEditListAlert(list: TraiviuList) {
    console.log('Falta conectar editar lista con Spring Boot', list.id);
  }
}
