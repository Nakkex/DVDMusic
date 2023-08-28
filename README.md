# DVD

Este es un bot de música para Discord que permite a los usuarios reproducir música en un canal de voz utilizando comandos.

[![Demo Video](https://cdn.discordapp.com/attachments/1097783484614987817/1101452133099900948/Thumnail.png)](addingsooner)

## Funciones

- Reproduce música desde YouTube, Spotify y TODAS las fuentes. 
- Pausa y reanuda la reproducción.
- Salta a la siguiente canción en la cola.
- Muestra la canción actual y la cola.
- Abandona el canal de voz.

## Uso

Para utilizar el bot, invítalo a tu servidor y únete a un canal de voz. Luego, utiliza los siguientes comandos en un canal de texto:

- `/play <song name>`: Plays the specified song from YouTube
- `/pause`: Pauses the playback
- `/resume`: Resumes the playback
- `/skip`: Skips to the next song in the queue
- `/queue`: Shows the current queue
- `/nowplaying`: Shows the current song
- `/leave`: Leaves the voice channel
- ETC

## Instalación y Configuración

Para usar este bot en tu propio servidor, debes seguir estos pasos:

1. Clona este repositorio en tu máquina local utilizando `git clone https://github.com/ScienceGear/music-bot.git`.
2. Instala las dependencias requeridas ejecutando `npm install` en el directorio raíz.
3. Crea una nueva aplicación y una cuenta de bot en el [Portal de Desarrolladores de Discord](https://discord.com/developers/applications).
4. Copia el `TOKEN` de tu bot y guardalo en `botconfig.js`
5. Invita al bot a tu servidor utilizando el siguiente enlace: `https://discord.com/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&scope=bot&permissions=2205281600` donde `YOUR_BOT_CLIENT_ID` es el ID de cliente de tu bot, que se encuentra en el Portal de Desarrolladores.
Inicia el bot ejecutando node index.js en el directorio raíz de este proyecto.

## Contribuciones

¡Las contribuciones son siempre bienvenidas! Si encuentras un error o quieres agregar una nueva función, por favor crea un issue o envía una pull request.
Basado en https://github.com/Nakkex/DVD

## Licencia

Este proyecto está bajo la [Licencia MIT](https://opensource.org/licenses/MIT).
