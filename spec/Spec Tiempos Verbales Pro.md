A la lista actual de sesiones de juego: "Vocabulario", "Tiempos Verbales" y "Armar Oraciones", añadir "Tiempos Verbales Pro" como una nueva sesión de juego.

El juego consiste en una oración donde falta el verbo en una determinada posición. Está entre paréntesis cono pista el infinitivo del mismo
Por ejemplo:
I ___ to the school yesterday. (Go)
La respuesta correcta es "went". 

El usuario debe elegir entre 4 opciones: Verbo en presente contínuo, verbo en presente , participio pasado o infinitivo.

Cada sesión de juego consiste en elegir la forma verbal correcta para 5 oraciones. Suman 20 puntos cada oración y este juego debe tener ranking como tienen los otros.

Para nutrirnos de los datos vamos a crear una nueva tabla en nuestra base de datos de supabase con la siguiente estructura llamada verbs_pro

Id (UUID)
sentence (TEXT)
correctverbform (TEXT)
wrongtverbform1 (TEXT)
wrongtverbform2 (TEXT)
traduction (TEXT)

A nivel datos un ejemplo será así
Sentence: "I ___ to the school yesterday. (Go)"
correctverbform: "went"
wrongtverbform1: "gone"
wrongtverbform2: "going"
traduction: "Yo fui a la escuela ayer."

O sea yo me encargo de poner el verbo infintivo entre paréntesis en el campo sentence.
Necesito un mecanismo visual claro para que el usuario elija entre las 3 formas verbales.
Necesito que las opciones aparezcan mezcladas de manera random como en los otros juegos para que el jugador no adivine cual es la correcta por ubicación.

Se puede asumir que en la parte de la oración donde pongo "___" va el verbo por lo cual a nivel interfaz se puede poner lo que haga falta ahí, una caja de texto con dropdown y las opciones, botones, lo que se te ocurra que se vea bien aunque siempre me gustaría que lo propongas como parte del plan.

Una vez que me des el script para crear la tabla voy a cargar 15 oraciones recuerda que cada sesión de juego consiste en 5 oraciones aleatorias entre el total de datos de la tabla. 

El juego deberá tener la misma pantalla previa que los otros juegos, o sea un título, el botón de jugar y el botón de ranking.

Al entrar comienza la primera de 5 oraciones con el formato de los otros juegos, título y puntaje actual en la parte superior, las 5 opciones de respuesta en botones o como sea para elegir una opcion correcta de 3 y al seleccionar se indica si fue correcto o no, si correcto suma 20 puntos, si no suma 0. Antes de pasar a la siguiente se muestra la traducción de la oración y el usuario con un botón pasa a la siguiente 



Cuando llega a 5 oraciones muestra la pantalla de resultados de esa sesión, puntaje y un botón de "Ver Ranking" para pasar a la pantalla de ranking de "Tiempos Verbales Pro".

Me gustaría que esto genere una nueva versión ordenada en mi respositorio de github e impacte en producción en vercel.


