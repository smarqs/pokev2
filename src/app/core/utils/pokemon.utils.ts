import { PokemonDetails } from '../models/pokemon.model';

export function getPokemonImage(pokemonId: number): string {
  //console.log("ID:", pokemonId);
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}

export function getDetalhesImage(pokemon: PokemonDetails | null): string {
  return (
    pokemon?.sprites.other?.['official-artwork']?.front_default ??
    pokemon?.sprites.front_default ??
    ''
  );
}
