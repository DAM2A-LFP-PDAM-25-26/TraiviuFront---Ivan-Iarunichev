import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ListsService, TraiviuList } from '../../core/api/lists';

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

  constructor(private listsService: ListsService){}

  ngOnInit() {
    this.loadLists();
  }

  loadLists() {
    this.isLoading = true;
    this.listsService.getListsByUser(this.testUserId).subscribe({
      next: (data: any) => {
        this.lists = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar las listas:', err);
        this.isLoading = false;
      }
    });
  }
}
