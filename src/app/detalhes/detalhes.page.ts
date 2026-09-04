import { ChangeDetectorRef, Component, inject, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

import { PokemonDetails } from '../core/models/pokemon.model';
import { FavoritesService } from '../core/services/favorites.service';
import { PokeApiService } from '../core/services/pokeApi.service';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.page.html',
  styleUrls: ['./detalhes.page.scss'],
  standalone: false,
})
export class DetalhesPage implements OnInit {
  pokemon: PokemonDetails | null = null;
  isLoading = false;
  errorMessage = '';

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly pokeApiService = inject(PokeApiService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  ngOnInit(): void {
    const pokemonName = this.activatedRoute.snapshot.paramMap.get('name');

    if (!pokemonName) {
      this.errorMessage = 'Pokémon não encontrado.';
      return;
    }

    this.loadPokemon(pokemonName);
  }

  loadPokemon(identifier: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.pokeApiService
      .getPokemonDetails(identifier)
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }),
      )
      .subscribe({
        next: (pokemon) => {
          this.ngZone.run(() => {
            this.pokemon = pokemon;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            console.error('Erro ao carregar detalhes do Pokémon:', error);
            this.errorMessage =
              'Não foi possível carregar os detalhes. Tente novamente.';
            this.cdr.detectChanges();
          });
        },
      });
  }

  isFavorite(): boolean {
    return this.pokemon
      ? this.favoritesService.isFavorite(this.pokemon.name)
      : false;
  }

  toggleFavorite(): void {
    if (!this.pokemon) {
      return;
    }

    this.favoritesService.toggleFavorite({
      name: this.pokemon.name,
      url: `https://pokeapi.co/api/v2/pokemon/${this.pokemon.id}/`,
    });
    this.cdr.detectChanges();
  }

  getPokemonImage(): string {
    return (
      this.pokemon?.sprites.other?.['official-artwork']?.front_default ??
      this.pokemon?.sprites.front_default ??
      ''
    );
  }

  formatHeight(height: number): string {
    return `${(height / 10).toFixed(1)} m`;
  }

  formatWeight(weight: number): string {
    return `${(weight / 10).toFixed(1)} kg`;
  }

  getStatPercentage(baseStat: number): number {
    return Math.min(100, Math.round((baseStat / 255) * 100));
  }

  retry(): void {
    const pokemonName = this.activatedRoute.snapshot.paramMap.get('name');

    if (pokemonName) {
      this.loadPokemon(pokemonName);
    }
  }
}
