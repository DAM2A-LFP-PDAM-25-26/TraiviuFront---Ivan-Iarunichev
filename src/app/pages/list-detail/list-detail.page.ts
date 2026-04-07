import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListItemService } from '../../services/list-item';
import { ListsService, TraiviuList } from '../../core/api/lists';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { SearchMoviesPage } from '../search-movies/search-movies.page';

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
  textoBusqueda: string = '';
  nombreLista: string = 'Cargando...';

  peliculas: any[] = [];
  peliculasFiltradas: any[] = [];

  private testUserId = '4beac43a-2c09-4a20-9fdd-f6540b8c8e4d';

  constructor(
    private route: ActivatedRoute,
    private listItemService: ListItemService,
    private listsService: ListsService,
    private router: Router,
    private modalController: ModalController,
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
      next: (data: any) => {
        this.peliculas = Array.isArray(data) ? data : [];
        this.aplicarFiltros();
        console.log('Películas cargadas de la BD:', this.peliculas);
      },
      error: (err) => {
        console.error('Error al cargar la lista', err);
        this.peliculas = [];
        this.peliculasFiltradas = [];
      },
    });
  }

  aplicarFiltros() {
    let resultado = [...this.peliculas];

    if (this.textoBusqueda.trim()) {
      const texto = this.textoBusqueda.toLowerCase().trim();

      resultado = resultado.filter((peli) =>
        peli.title?.toLowerCase().includes(texto),
      );
    }

    resultado = resultado.filter((peli) => this.cumpleFiltroPeriodo(peli));

    this.peliculasFiltradas = resultado;
  }

  cumpleFiltroPeriodo(peli: any): boolean {
    if (this.filtroPeriodo === 'todos') {
      return true;
    }

    if (!peli.addedAt) {
      return false;
    }

    const fechaPelicula = new Date(peli.addedAt);
    const ahora = new Date();

    const inicioHoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
    );

    switch (this.filtroPeriodo) {
      case 'semana': {
        const inicioSemana = new Date(inicioHoy);
        const dia = inicioSemana.getDay();
        const diff = dia === 0 ? 6 : dia - 1;
        inicioSemana.setDate(inicioSemana.getDate() - diff);
        return fechaPelicula >= inicioSemana;
      }

      case 'mes': {
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        return fechaPelicula >= inicioMes;
      }

      case 'mesAnterior': {
        const inicioMesAnterior = new Date(
          ahora.getFullYear(),
          ahora.getMonth() - 1,
          1,
        );
        const inicioMesActual = new Date(
          ahora.getFullYear(),
          ahora.getMonth(),
          1,
        );
        return (
          fechaPelicula >= inicioMesAnterior && fechaPelicula < inicioMesActual
        );
      }

      case 'anio': {
        const inicioAnio = new Date(ahora.getFullYear(), 0, 1);
        return fechaPelicula >= inicioAnio;
      }

      case 'anioAnterior': {
        const inicioAnioAnterior = new Date(ahora.getFullYear() - 1, 0, 1);
        const inicioAnioActual = new Date(ahora.getFullYear(), 0, 1);
        return (
          fechaPelicula >= inicioAnioAnterior &&
          fechaPelicula < inicioAnioActual
        );
      }

      default:
        return true;
    }
  }

  borrarPelicula(itemId: string) {
    this.listItemService.removeMovieFromList(itemId).subscribe({
      next: () => {
        this.peliculas = this.peliculas.filter((p) => p.id !== itemId);
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error al borrar la película', err);
      },
    });
  }

  async abrirBuscadorPeliculas() {
    const modal = await this.modalController.create({
      component: SearchMoviesPage,
      componentProps: {
        listId: this.listId,
        nombreLista: this.nombreLista,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data?.actualizar) {
      this.cargarPeliculas();
    }
  }

  goBack() {
    this.router.navigate(['/tabs/lists']);
  }
}
