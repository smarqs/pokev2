import { ChangeDetectorRef, Component, inject, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  favoriteIds = new Set<number>();

  private readonly pokeApiService = inject(PokeApiService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);


  ngOnInit(): void {
    this.favoriteIds = new Set(
      this.favoritesService.getFavorites().map(({ id }) => id),
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

  openDetails(pokemon: PokemonListItem): void {
    this.router.navigate(['/pokemon', pokemon.id]);
  }

  onFavoriteClick(event: Event, pokemon: PokemonListItem): void {
    event.stopPropagation();
    this.toggleFavorite(pokemon);
  }

  isFavorite(pokemon: PokemonListItem): boolean {
    return this.favoriteIds.has(pokemon.id);
  }

  toggleFavorite(pokemon: PokemonListItem): void {
    const isNowFavorite = this.favoritesService.toggleFavorite(pokemon);

    if (isNowFavorite) {
      this.favoriteIds.add(pokemon.id);
    } else {
      this.favoriteIds.delete(pokemon.id);
    }

    this.cdr.detectChanges();
  }

  getPokemonImage(pokemonId: number): string {
    //console.log("ID:", pokemonId);
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  }

  trackById(_: number, pokemon: PokemonListItem): number {
    return pokemon.id;
  }
}
