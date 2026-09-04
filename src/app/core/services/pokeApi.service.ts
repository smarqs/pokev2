import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  PokemonDetails,
  PokemonListResponse,
} from '../models/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class PokeApiService {
  private readonly apiUrl = environment.pokeApiUrl;

  constructor(private readonly http: HttpClient) {}

  getPokemonPage(page: number, limit: number): Observable<PokemonListResponse> {
    const params = new HttpParams()
      .set('offset', this.getOffset(page, limit))
      .set('limit', limit);

    return this.http.get<PokemonListResponse>(`${this.apiUrl}/pokemon`, {
      params,
    });
  }

  getPokemonDetails(identifier: string | number): Observable<PokemonDetails> {
    return this.http.get<PokemonDetails>(
      `${this.apiUrl}/pokemon/${encodeURIComponent(identifier)}`,
    );
  }

  private getOffset(page: number, limit: number): number {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.max(1, Math.floor(limit));

    return (safePage - 1) * safeLimit;
  }
}
