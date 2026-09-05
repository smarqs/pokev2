import { Injectable } from '@angular/core';

import { PokemonListItem } from '../models/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly storageKey = 'pokemon-catalog:favorites';

  getFavorites(): PokemonListItem[] {
    const storedFavorites = localStorage.getItem(this.storageKey);

    if (!storedFavorites) {
      return [];
    }

    try {
      const favorites: unknown = JSON.parse(storedFavorites);

      return Array.isArray(favorites) ? (favorites as PokemonListItem[]) : [];
    } catch {
      return [];
    }
  }

  isFavorite(pokemonId: number): boolean {
    return this.getFavorites().some(({ id }) => id === pokemonId);
  }

  toggleFavorite(pokemon: PokemonListItem): boolean {
    const favorites = this.getFavorites();
    const favoriteIndex = favorites.findIndex(({ id }) => id === pokemon.id);

    if (favoriteIndex >= 0) {
      favorites.splice(favoriteIndex, 1);
      this.saveFavorites(favorites);
      return false;
    }

    this.saveFavorites([...favorites, pokemon]);
    return true;
  }

  private saveFavorites(favorites: PokemonListItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(favorites));
  }
}
