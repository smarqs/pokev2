import { ChangeDetectorRef, Component, inject, NgZone, OnInit } from '@angular/core';
import { finalize } from 'rxjs';

import { PokemonListItem } from '../core/models/pokemon.model';
import { FavoritesService } from '../core/services/favorites.service';
import { PokeApiService } from '../core/services/pokeApi.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  readonly pageSize = 20;

  pokemon: PokemonListItem[] = [];
  currentPage = 1;
  totalCount = 0;
  isLoading = false;
  errorMessage = '';
  favoriteNames = new Set<string>();

  private readonly pokeApiService = inject(PokeApiService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);


  ngOnInit(): void {
    this.favoriteNames = new Set(
      this.favoritesService.getFavorites().map(({ name }) => name),
    );
    this.loadPage();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  get canGoToPreviousPage(): boolean {
    return this.currentPage > 1 && !this.isLoading;
  }

  get canGoToNextPage(): boolean {
    return this.currentPage < this.totalPages && !this.isLoading;
  }

  loadPage(page = this.currentPage): void {
    if (page < 1 || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.pokeApiService
      .getPokemonPage(page, this.pageSize)
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        })
      )

      .subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            this.pokemon = response.results;
            this.currentPage = page;
            this.totalCount = response.count;
            this.cdr.detectChanges();
          });

        },
        error: (err) => {
          this.ngZone.run(() => {
            console.error('Erro na requisição:', err);
            this.errorMessage = 'Não foi possível carregar os Pokémon. Tente novamente.';
            this.cdr.detectChanges();
          });
        },
      });
  }

  goToPreviousPage(): void {
    if (this.canGoToPreviousPage) {
      this.loadPage(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.canGoToNextPage) {
      this.loadPage(this.currentPage + 1);
    }
  }

  retry(): void {
    this.loadPage();
  }

  isFavorite(pokemon: PokemonListItem): boolean {
    return this.favoriteNames.has(pokemon.name);
  }

  toggleFavorite(pokemon: PokemonListItem): void {
    const isNowFavorite = this.favoritesService.toggleFavorite(pokemon);

    if (isNowFavorite) {
      this.favoriteNames.add(pokemon.name);
    } else {
      this.favoriteNames.delete(pokemon.name);
    }

    this.cdr.detectChanges();
  }

  getPokemonId(url: string): number {
    const segments = url.split('/').filter(Boolean);
    return Number(segments[segments.length - 1]);
  }

  getPokemonImage(url: string): string {
    const pokemonId = this.getPokemonId(url);

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  }

  trackByName(_: number, pokemon: PokemonListItem): string {
    return pokemon.name;
  }
}
