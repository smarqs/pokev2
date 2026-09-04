import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { finalize } from 'rxjs';

import { PokemonListItem } from '../core/models/pokemon.model';
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

  constructor(
    private readonly pokeApiService: PokeApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) { }

  ngOnInit(): void {
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
