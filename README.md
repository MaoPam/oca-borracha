# Oca Borracha

Tablero digital de la Oca Borracha (Hazifest Vol. 1): las 60 casillas de la lona en espiral, fichas que avanzan solas, casillas comodín con retos misteriosos y la Ruleta de la Victoria con los premios de cada jugador.

## Correr el proyecto

```bash
npm install
npm run dev      # servidor local
npm run build    # versión para publicar (carpeta dist/)
npm test         # pruebas de las reglas del tablero
npm run lint
```

## Dónde se edita cada cosa

| Quiero cambiar… | Archivo |
| --- | --- |
| El texto de una casilla, su explicación ("Cómo se juega") o su ícono | `src/data/casillas.js` |
| Qué casillas son comodín (estrellitas/kirbys) | `COMODINES` en `src/data/casillas.js` |
| Llegar exacto a la 60 o que pasarse también gane | `LLEGADA_EXACTA` en `src/data/casillas.js` |
| Los retos misteriosos | `src/data/retos.js` |
| Qué hace cada casilla especial (avanzar, retroceder, perder turno…) | `src/game/reglas.js` |
| Colores de las fichas | `src/components/colores.js` |
| Estética (colores, letras, tablero) | `src/App.css` |

## Cómo funciona un turno

1. Se tira 1 o 2 dados y la ficha avanza casilla por casilla.
2. Al caer se muestra el mensaje de la lona y, si hace falta, un letrero de "Cómo se juega".
3. Casillas especiales:
   - **3**: se tira otro dado para saber cuántos tragos repartes.
   - **7**: bebes y vuelves a tirar.
   - **31**: avanzas 3 y cumples la casilla nueva.
   - **45**: retrocedes 4 y cumples la casilla nueva.
   - **49**: pierdes tu siguiente turno.
   - **58**: tiras el dado y retrocedes lo que salga.
   - **Comodines**: eliges entre hacer lo de la lona o sacar un reto misterioso.
   - **60**: llegas a la Ruleta de la Victoria y giras por tu premio. Los demás pueden seguir jugando por los siguientes lugares.
4. "Siguiente turno" pasa al que sigue.

## Guardado

La partida se guarda sola en el navegador (localStorage): si se recarga la página o se cierra la pestaña, aparece "Continuar la partida". La bitácora guarda cada jugada (quién, qué sacó, a qué casilla llegó, qué reto le tocó) en `src/game/guardado.js`, con una forma pensada para pasarla a Firebase (una colección `partidas/{id}/jugadas`) cuando se conecte.

## Estructura

```
src/
  App.jsx                 pantallas y flujo del turno
  App.css                 estética
  components/
    Tablero.jsx           tablero en espiral con fichas de corazón
    Dado3D.jsx            dado de peluche en 3D
    Ruleta.jsx            Ruleta de la Victoria
    Simbolos.jsx          íconos SVG
    colores.js            colores de las fichas
  data/
    casillas.js           las 60 casillas
    retos.js              retos misteriosos
  game/
    reglas.js             reglas puras (espiral, pasos, efectos, turnos)
    reglas.test.js        pruebas
    guardado.js           guardado local y bitácora
```
