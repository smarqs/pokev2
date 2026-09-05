import { ChangeDetectorRef, Component, inject, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { PokemonListItem } from '../core/models/pokemon.model';
import { FavoritesService } from '../core/services/favorites.service';
import { PokeApiService } from '../core/services/pokeApi.service';

import { getPokemonImage as getPokemonImageFromUrl } from '../core/utils/pokemon.utils';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  readonly pageSize = 20;

  pokemon: PokemonListItem[] = [];
  currentPage = 1;
    pageInput = 1;

  totalCount = 0;
  isLoading = false;
  errorMessage = '';
  favoriteIds = new Set<number>();

  private readonly pokeApiService = inject(PokeApiService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  readonly getPokemonImage = getPokemonImageFromUrl;

  ionViewWillEnter(): void {
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
                        this.pageInput = page;

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

    goToPage(): void {
    const targetPage = Math.trunc(Number(this.pageInput));

    if (targetPage >= 1 && targetPage <= this.totalPages) {
      this.loadPage(targetPage);
      return;
    }

    this.pageInput = this.currentPage;
  }

  retry(): void {
    this.loadPage();
  }

  get showEmptyState(): boolean {
    return !this.isLoading && !this.errorMessage && this.pokemon.length === 0;
  }

  get showPagination(): boolean {
    return !this.isLoading && !this.errorMessage && this.pokemon.length > 0;
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

  trackById(_: number, pokemon: PokemonListItem): number {
    return pokemon.id;
  }
}
