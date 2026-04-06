import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListItemService } from '../../services/list-item';
import { ListsService, TraiviuList } from '../../core/api/lists';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.page.html',
  styleUrls: ['./list-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
})
export class ListDetailPage implements OnInit {
  listId: string = '';
  filtroPeriodo: string = 'mes';
  nombreLista: string = 'Cargando...';
  peliculas: any[] = [];

  private testUserId = '4beac43a-2c09-4a20-9fdd-f6540b8c8e4d';

  constructor(
    private route: ActivatedRoute,
    private listItemService: ListItemService,
    private listsService: ListsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.listId = this.route.snapshot.paramMap.get('id') || '';

    if (this.listId) {
      this.cargarPeliculas();
      this.cargarDatosDeLaLista();
    }
  }

  cargarDatosDeLaLista() {
    this.listsService.getListsByUser(this.testUserId).subscribe({
      next: (listas: TraiviuList[]) => {
        const listaActual = listas.find((lista) => lista.id === this.listId);

        if (listaActual) {
          this.nombreLista = listaActual.name;
        } else {
          this.nombreLista = 'Lista no encontrada';
        }
      },
      error: (err: any) => {
        console.error('Error al cargar el nombre de la lista:', err);
        this.nombreLista = 'Detalle de Lista';
      },
    });
  }

  cargarPeliculas() {
    this.listItemService.getMoviesFromList(this.listId).subscribe({
      next: (data) => {
        this.peliculas = data;
        console.log('Películas cargadas de la BD:', this.peliculas);
      },
      error: (err) => {
        console.error('Error al cargar la lista', err);
      },
    });
  }

  borrarPelicula(itemId: string) {
    this.listItemService.removeMovieFromList(itemId).subscribe({
      next: () => {
        this.peliculas = this.peliculas.filter((p) => p.id !== itemId);
      },
    });
  }

  goBack() {
    this.router.navigate(['/tabs/lists']);
  }
}
