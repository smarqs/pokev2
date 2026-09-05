import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { PokemonListItem } from '../core/models/pokemon.model';
import { FavoritesService } from '../core/services/favorites.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage {
  favorites: PokemonListItem[] = [];

  private readonly favoritesService = inject(FavoritesService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.favorites = this.favoritesService.getFavorites();
    console.log("id: ", this.favorites);
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

  getPokemonImage(pokemonId: number): string {
    //console.log("ID:", pokemonId);
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  }
}