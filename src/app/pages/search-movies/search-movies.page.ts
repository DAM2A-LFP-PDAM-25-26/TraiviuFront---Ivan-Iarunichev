import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { TmdbService } from '../../services/tmdb';
import { ListItemService } from '../../services/list-item';

@Component({
  selector: 'app-search-movies',
  templateUrl: './search-movies.page.html',
  styleUrls: ['./search-movies.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SearchMoviesPage implements OnInit {
  @Input() listId: string = '';
  @Input() nombreLista: string = '';

  searchText: string = '';
  movies: any[] = [];
  loading: boolean = false;

  constructor(
    private tmdbService: TmdbService,
    private listItemService: ListItemService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    console.log('listId recibido en modal:', this.listId);
    console.log('nombreLista recibida en modal:', this.nombreLista);
    this.cargarPopulares();
  }

  cargarPopulares() {
    this.loading = true;

    this.tmdbService.getPopularMovies().subscribe({
      next: (resp) => {
        this.movies = (resp.results || []).filter(
          (item: any) => item.media_type === 'movie' || !item.media_type
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando populares', err);
        this.loading = false;
      },
    });
  }

  buscarPeliculas() {
    const texto = this.searchText.trim();

    if (!texto) {
      this.cargarPopulares();
      return;
    }

    this.loading = true;

    this.tmdbService.searchMulti(texto).subscribe({
      next: (resp) => {
        this.movies = (resp.results || []).filter(
          (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error buscando contenido', err);
        this.loading = false;
      },
    });
  }

  anadirPelicula(movie: any) {
    const titulo = movie.title || movie.name || '';
    const fecha = movie.release_date || movie.first_air_date || '';
    const year = fecha ? fecha.substring(0, 4) : '';

    const movieData = {
      listId: this.listId,
      externalApiId: movie.id.toString(),
      title: titulo,
      year: year,
      posterUrl: this.tmdbService.getPosterUrl(movie.poster_path),
    };

    console.log('Añadiendo a lista:', movieData);

    this.listItemService.addMovieToList(movieData).subscribe({
      next: () => {
        this.modalController.dismiss({ actualizar: true });
      },
      error: (err) => {
        console.error('Error al añadir película/serie', err);
      },
    });
  }

  goBack() {
    this.modalController.dismiss();
  }

  getPoster(path: string | null): string {
    return this.tmdbService.getPosterUrl(path);
  }
}
