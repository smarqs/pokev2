import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  PokemonDetails,
  PokemonListResponse,
} from '../models/pokemon.model';
import { map } from 'rxjs/operators';
/*import { forkJoin, switchMap, of } from 'rxjs';*/ //Pegar ID de dentro da URL do pokemon

@Injectable({
  providedIn: 'root',
})
export class PokeApiService {
  private readonly apiUrl = environment.pokeApiUrl;
  private readonly http = inject(HttpClient);
  private readonly requestTimeoutMs = 10000;
  
  getPokemonPage(page: number, limit: number): Observable<PokemonListResponse> {
    const params = new HttpParams()
      .set('offset', this.getOffset(page, limit))
      .set('limit', limit);

    return this.http.get<PokemonListResponse>(`${this.apiUrl}/pokemon`, { params }).pipe(
      timeout({ each: this.requestTimeoutMs }),
      map((response) => ({
        ...response,
        results: response.results.map((item) => ({
          ...item,
          id: this.getPokemonId(item.url),
        })),
      })),
    );
  }

  /*
  getPokemonPage(page: number, limit: number): Observable<PokemonListResponse> {
    const params = new HttpParams()
      .set('offset', this.getOffset(page, limit))
      .set('limit', limit);

    return this.http.get<PokemonListResponse>(`${this.apiUrl}/pokemon`, { params }).pipe(
      switchMap((response) => {
        // se a lista vier vazia, forkJoin com array vazio nunca emite — trata à parte
        if (response.results.length === 0) {
          return of({ ...response, results: [] });
        }

        const detailRequests = response.results.map((item) =>
          this.getPokemonDetails(item.name),
        );

        return forkJoin(detailRequests).pipe(
          map((detailsList) => ({
            ...response,
            results: detailsList.map((details) => ({
              id: details.id,
              name: details.name,
              url: `${this.apiUrl}/pokemon/${details.id}/`,
            })),
          })),
        );
      }),
    );
  }
  */ //Pegar ID de dentro da URL do pokemon
  
  private getPokemonId(url: string): number {
    const segments = url.split('/').filter(Boolean);
    return Number(segments[segments.length - 1]);
  }

  getPokemonDetails(identifier: string | number): Observable<PokemonDetails> {
    return this.http.get<PokemonDetails>(
      `${this.apiUrl}/pokemon/${encodeURIComponent(identifier)}`,
    ).pipe(timeout({ each: this.requestTimeoutMs }));
  }

  private getOffset(page: number, limit: number): number {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.max(1, Math.floor(limit));

    return (safePage - 1) * safeLimit;
  }
}
