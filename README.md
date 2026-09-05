# POKEDEX V2

# Sobre
A Pokedex é uma aplicação Ionic com Angular criada para consultar a PokeAPI, navegar por páginas carregadas diretamente do servidor, visualizar detalhes e gerenciar favoritos com persistência local; o projeto prioriza separação de responsabilidades, componentes simples, injeção de dependência e uma interface responsiva para dispositivos móveis.
A estrutura foi organizada em páginas, serviços, modelos e alguns utilitários para evitar responsabilidades concentradas em um único componente. Os favoritos foram implementados com auxílio de localStorage, para manter salvos persistentemente. Os estados de carregamento, erro e ausência de dados foram tratados explicitamente para evitar telas sem feedback.

# Requisitos
- Node.js 26.8.1
- npm 11.19.1
- Ionic 9.0.2
- Angular 22.0.1
- TypeScript 6.0.3
- HTML 5 (Componentes do Ionic)
- SCSS 1.99.0
- API da PokeApi (https://pokeapi.co)

# Instalação e execução
1) Instale o Node.js junto com npm a partir do instalador:
```bash
https://nodejs.org/pt-br/download/current
```

2) Instale o Ionic:;
```bash
npm install -g @ionic/cli
```

3) Clone o repositório:
```bash
https://github.com/smarqs/pokev2.git
```

4) Instale as dependências:
```bash
npm install
```

5) Inicie o servidor local e acesse o link local:
```bash
ionic serve
```
