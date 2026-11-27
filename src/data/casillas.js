// Las 60 casillas de la lona de la Oca Borracha.
// corto: lo que se lee en el tablero · mensaje: el texto de la lona
// aclara: "cómo se juega" para las casillas que no son tan obvias
// icono: símbolo de src/components/Simbolos.jsx · tipo: bonus (azul), trampa (rojo), inicio, meta
export const META = 60;

// Si es true hay que llegar a la 60 con la cuenta exacta; si te pasas, rebotas.
// Si es false, llegar o pasarse de la 60 gana (como estaba antes).
export const LLEGADA_EXACTA = true;

// Casillas comodín (las de estrellitas/kirbys en la lona): puedes cambiar
// lo que dice la casilla por un reto misterioso.
export const COMODINES = [6, 10, 18, 21, 28, 30, 33, 35, 39, 41, 42, 47, 50, 52, 54, 56, 59];

const c = (corto, mensaje, icono, extra = {}) => ({ corto, mensaje, icono, ...extra });

export const CASILLAS = {
  1: c('Inicio', 'Todas las fichas salen de aquí.', 'salida', { tipo: 'inicio' }),
  2: c('Todos beben', 'Todos beben.', 'tarro'),
  3: c('Reparte tragos', 'Tira el dado y reparte el número de tragos que salga.', 'dado', { aclara: 'Se tira otro dado: el número que salga son los tragos que repartes entre quien tú quieras.' }),
  4: c('Alguien de aquí…', 'Alguien de aquí…', 'globo', { aclara: 'Termina la frase "Alguien de aquí…" con algo que sepas del grupo (ya besó a alguien de la mesa, le debe dinero a otro…). Quien sea, bebe.' }),
  5: c('Toma sin manos', 'Toma sin manos.', 'reto', { aclara: 'Tómate tu trago sin usar las manos.' }),
  6: c('Dato curioso', 'Tírate un dato curioso.', 'globo', { aclara: 'Cuenta un dato curioso que nadie de la mesa sepa.' }),
  7: c('Tira de nuevo y bebe', 'Tira de nuevo y bebe.', 'dado', { tipo: 'bonus', aclara: 'Bebes y vuelves a tirar.' }),
  8: c('Julio a diciembre', 'Toman los nacidos entre julio y diciembre.', 'tarro'),
  9: c('Los hombres beben', 'Los hombres beben.', 'tarro'),
  10: c('Tu migajeada', 'Cuenta tu migajeada. Hmmmm, migajas.', 'globo', { aclara: 'Cuenta la vez que más te conformaste con migajas de amor.' }),
  11: c('Con perfo beben', 'Los que tienen perfo beben.', 'tarro'),
  12: c('Primer whats', 'Bebe quien reciba un whats primero.', 'cel'),
  13: c('Pasa lumbre', 'Pasa o que te pasen lumbre.', 'reto', { aclara: 'Pásale el humo boca a boca a alguien, o deja que alguien te lo pase a ti.' }),
  14: c('Piedra, papel o tijera', 'Piedra, papel o tijera con el de la derecha.', 'globo', { aclara: 'Juegas piedra, papel o tijera con quien está a tu derecha. Quien pierda, bebe.' }),
  15: c('Las chicas beben', 'Las niñas lomecan beben.', 'tarro', { aclara: 'Beben todas las chicas.' }),
  16: c('Los que fuman', 'Los que fuman beben.', 'tarro'),
  17: c('Dos retos', 'Te dan 2 retos y eliges uno.', 'reto', { aclara: 'El grupo te propone 2 retos y tú eliges cuál cumplir.' }),
  18: c('Pon una regla', 'Pon una regla.', 'corona', { aclara: 'Inventa una regla que todos deben seguir el resto de la partida (por ejemplo, no decir nombres). Quien la rompa, bebe.' }),
  19: c('Shot coqueto', 'Shot coqueto.', 'shot', { aclara: 'Tómate un shot de la forma más coqueta que puedas.' }),
  20: c('Enero a junio', 'Beben los nacidos entre enero y junio.', 'tarro'),
  21: c('Botellita', 'Botellita.', 'globo', { aclara: 'Gira una botella: a quien apunte te hace una pregunta o te pone un reto.' }),
  22: c('Adivina quién', 'Adivina quién.', 'globo', { aclara: 'Piensa en alguien de la mesa. Los demás adivinan quién es con preguntas de sí o no.' }),
  23: c('El + paleolítico', 'Bebe el más paleolítico.', 'tarro', { aclara: 'Bebe la persona más grande de edad.' }),
  24: c('Menos de 1.70', 'Los de menos de 1.70 beben.', 'tarro'),
  25: c('Los 3 + guapos', 'Los 3 más guapos beben.', 'tarro'),
  26: c('Los Fifes', 'Beben los Fifes.', 'tarro', { aclara: 'Beben los que juegan FIFA.' }),
  27: c('Momento crujiente', 'Tu momento más crujiente.', 'globo', { aclara: 'Cuenta tu momento más cringe.' }),
  28: c('Muerde', 'Muerde al de enfrente.', 'labios', { aclara: 'Muerde (suavecito) a quien está enfrente de ti.' }),
  29: c('Yo nunca nunca', 'Yo nunca nunca.', 'globo', { aclara: 'Di algo que nunca hayas hecho. Quien sí lo haya hecho, bebe.' }),
  30: c('Fondéate', 'Fondéate lo que estés tomando.', 'tarro', { aclara: 'Termínate de un trago lo que tengas en tu vaso.' }),
  31: c('Avanza 3', 'Avanza 3 casillas.', 'adelante', { tipo: 'bonus', aclara: 'Avanzas 3 casillas y cumples lo que diga la nueva.' }),
  32: c('Menos seguidores', 'Quien tenga menos seguidores en IG bebe, pero no lo hace sol@.', 'cel', { aclara: 'Quien tenga menos seguidores en IG bebe, y escoge a alguien que beba con él o ella.' }),
  33: c('Intercambia prenda', 'Intercambia prenda con el de la derecha.', 'reto'),
  34: c('¿Qué probabilidad?', '¿Qué probabilidad? Con quien quieras.', 'globo', { aclara: 'Retas a alguien: "¿qué probabilidad hay de que…?". Elige un número del 1 al 10, cuentan a 3 y dicen un número a la vez. Si coinciden, cumple el reto.' }),
  35: c('Nota random de IG', 'Contesta una nota random de IG.', 'cel', { aclara: 'Abre IG y contéstale la nota a alguien al azar.' }),
  36: c('Más de 1.70', 'Los de más de 1.70 beben.', 'tarro'),
  37: c('😈 💍 🔪', '😈 💍 🔪 con los que están a tu lado y enfrente.', 'globo', { aclara: 'Con los que están a tu lado y enfrente: a quién te darías 😈, con quién te casarías 💍 y a quién matarías 🔪.' }),
  38: c('LGBTI+ beben', 'LGBTI+ beben.', 'tarro'),
  39: c('Tu posición favorita', 'Recrea tu posición sexual favorita con quien esté a tu izquierda.', 'labios'),
  40: c('Cierra el papoi', 'Vamos cerrando el papoi por un turno.', 'reto', { aclara: 'No puedes hablar hasta tu siguiente turno. Si hablas, bebes.' }),
  41: c('2 minutos a solas', '2 personas a solas 2 minutos. Tú escoges quiénes.', 'labios', { aclara: 'Escoges a 2 personas que se van a solas 2 minutos.' }),
  42: c('Haz el 4', 'En 4: haz el 4.', 'reto', { aclara: 'Haz el 4: cruza una pierna y aguanta en un pie. Si no puedes, bebes.' }),
  43: c('El + sobrio', 'Bebe el más sobrio.', 'tarro', { aclara: 'Bebe quien se vea más sobrio de la mesa.' }),
  44: c('Tus vecinos beben', 'Beben los que están a tu lado.', 'tarro', { aclara: 'Beben las personas a tu izquierda y a tu derecha.' }),
  45: c("Pa' atrás 4", "Vas pa' atrás 4 casillas.", 'atras', { tipo: 'trampa', aclara: 'Retrocedes 4 casillas y cumples la casilla donde caigas.' }),
  46: c('El + joven', 'Bebe el más joven.', 'tarro'),
  47: c('Body shot', 'Body shot.', 'shot', { aclara: 'Tómate un shot del cuerpo de alguien que acepte.' }),
  48: c('Volado', 'Volado con el de la izquierda.', 'globo', { aclara: 'Echas un volado con quien está a tu izquierda. Quien pierda, bebe.' }),
  49: c('Detente jochis', 'Detente, jochis: no tiras por un turno.', 'alto', { tipo: 'trampa', aclara: 'Pierdes tu siguiente turno.' }),
  50: c('Semana inglesa', 'Semana inglesa.', 'globo', { aclara: 'Elige a alguien y, a la cuenta de 3, los dos dicen un día de la semana. Si coinciden, se besan; si no, no pasa nada.' }),
  51: c('Quien no se mueva', 'Quien se quede en su lugar bebe.', 'tarro', { aclara: 'Todos se cambian de lugar. Quien se quede en el mismo, bebe.' }),
  52: c('Beso de tres', 'Beso de tres.', 'labios', { aclara: 'Tres personas se dan un beso al mismo tiempo.' }),
  53: c('Truco de peda', 'Truco de peda.', 'reto', { aclara: 'Haz un truco o talento que solo te sale estando peda.' }),
  54: c('Prenda fuera', 'Prenda fuera. Woopsi.', 'reto', { aclara: 'Quítate una prenda.' }),
  55: c('Tú preparas', 'Tú preparas, otro bebe.', 'shot', { aclara: 'Tú preparas un trago y alguien más se lo toma.' }),
  56: c('Compartidos TikTok', 'Explica tus compartidos en TikTok.', 'cel', { aclara: 'Explica qué es lo último que compartiste en TikTok.' }),
  57: c('Más seguidores', 'Bebe quien tenga más seguidores en IG. OMG, sí, beba.', 'cel'),
  58: c('Retrocede el dado', 'Retrocede lo que te salga en el dado.', 'atras', { tipo: 'trampa', aclara: 'Tiras el dado y retrocedes lo que salga.' }),
  59: c('Shot por cada ex', 'Un shot por cada ex.', 'shot', { aclara: 'Tómate un shot por cada ex que tengas.' }),
  60: c('Ruleta de la victoria', 'Llegaste: gira la ruleta y cobra tu premio.', 'trofeo', { tipo: 'meta' }),
};

// Casillas que mueven fichas (se muestran en las reglas)
export const MOVIMIENTOS = [
  [7, 'Bebes y vuelves a tirar.'],
  [31, 'Avanzas 3 y cumples la casilla nueva.'],
  [3, 'Se tira otro dado para saber cuántos tragos repartes.'],
  [45, 'Retrocedes 4 y cumples la casilla donde caigas.'],
  [49, 'Pierdes tu siguiente turno.'],
  [58, 'Tiras el dado y retrocedes lo que salga.'],
  [60, LLEGADA_EXACTA ? 'Hay que llegar con la cuenta exacta; si te pasas, rebotas.' : 'Llegar o pasarte de la 60 gana.'],
];
