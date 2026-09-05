import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { PokemonListItem } from '../core/models/pokemon.model';
import { FavoritesService } from '../core/services/favorites.service';

import { getPokemonImage as getPokemonImageFromUrl } from '../core/utils/pokemon.utils';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage implements OnInit {
  favorites: PokemonListItem[] = [];

  private readonly favoritesService = inject(FavoritesService);
  private readonly router = inject(Router);

    private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.loadFavorites());
  }


  readonly getPokemonImage = getPokemonImageFromUrl;

  ngOnInit(): void {
        this.loadFavorites();
  }

  private loadFavorites(): void {
    this.favorites = this.favoritesService.getFavorites();

  }

  openDetails(pokemon: PokemonListItem): void {
    this.router.navigate(['/pokemon', pokemon.id]);
  }

  removeFavorite(event: Event, pokemon: PokemonListItem): void {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(pokemon);
    this.favorites = this.favorites.filter(
      ({ id }) => id !== pokemon.id,
    );
  }
}