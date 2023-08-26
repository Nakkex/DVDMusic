const { Util, MessageEmbed } = require("discord.js");
const { TrackUtils, Player } = require("erela.js");
const prettyMilliseconds = require("pretty-ms");
let d;

module.exports = {
  nombre: "play",
  descripción: "Reproduce tus canciones favoritas",
  uso: "[canción]",
  permisos: {
    canal: ["VER_CANAL", "ENVIAR_MENSAJES", "EMBED_LINKS"],
    miembro: [],
  },
  alias: ["p"],
  ejecutar: async (cliente, mensaje, args, { GuildDB }) => {
    if (!mensaje.member.voice.channel)
      return cliente.sendTime(
        mensaje.channel,
        "❌ | **¡Debes estar en un canal de voz para reproducir algo!**"
      );
    if (
      mensaje.guild.me.voice.channel &&
      mensaje.member.voice.channel.id !== mensaje.guild.me.voice.channel.id
    )
      return cliente.sendTime(
        mensaje.channel,
        "❌ | **¡Debes estar en el mismo canal de voz que yo para usar este comando!**"
      );
    let cadenaDeBusqueda = args.join(" ");
    if (!cadenaDeBusqueda)
      return cliente.sendTime(
        mensaje.channel,
        `**Uso - **\`${GuildDB.prefix}play [canción]\``
      );
    let nodoVerificado = cliente.Manager.nodes.get(cliente.botconfig.Lavalink.id);
    let buscando = await mensaje.channel.send(":mag_right: Buscando...");
    if (!nodoVerificado || !nodoVerificado.connected) {
      return cliente.sendTime(
        mensaje.channel,
        "❌ | **Nodo de Lavalink no conectado**"
      );
    }
    const reproductor = cliente.Manager.create({
      guild: mensaje.guild.id,
      voiceChannel: mensaje.member.voice.channel.id,
      textChannel: mensaje.channel.id,
      selfDeafen: cliente.botconfig.ServerDeafen,
      volume: cliente.botconfig.DefaultVolume,
    });

    let embedCanciónAñadida = new MessageEmbed().setColor(
      cliente.botconfig.EmbedColor
    );

    if (!reproductor)
      return cliente.sendTime(
        mensaje.channel,
        "❌ | **Nada se está reproduciendo en este momento...**"
      );

    if (reproductor.state != "CONNECTED") await reproductor.connect();

    try {
      if (cadenaDeBusqueda.match(cliente.Lavasfy.spotifyPattern)) {
        await cliente.Lavasfy.requestToken();
        let nodo = cliente.Lavasfy.nodes.get(cliente.botconfig.Lavalink.id);
        let buscado = await nodo.load(cadenaDeBusqueda);

        if (buscado.loadType === "PLAYLIST_LOADED") {
          let canciones = [];
          for (let i = 0; i < buscado.tracks.length; i++)
            canciones.push(TrackUtils.build(buscado.tracks[i], mensaje.author));
          reproductor.queue.add(canciones);
          if (
            !reproductor.playing &&
            !reproductor.paused &&
            reproductor.queue.totalSize === buscado.tracks.length
          )
            reproductor.play();
          embedCanciónAñadida.setAuthor(
            `Lista de reproducción añadida a la cola`,
            mensaje.author.displayAvatarURL()
          );
          embedCanciónAñadida.addField(
            "En cola",
            `\`${buscado.tracks.length}\` canciones`,
            false
          );
          buscando.edit(embedCanciónAñadida);
        } else if (buscado.loadType.startsWith("TRACK")) {
          reproductor.queue.add(
            TrackUtils.build(buscado.tracks[0], mensaje.author)
          );
          if (!reproductor.playing && !reproductor.paused && !reproductor.queue.size)
            reproductor.play();
          embedCanciónAñadida.setAuthor(`Añadida a la cola`, cliente.botconfig.IconURL);
          embedCanciónAñadida.setDescription(
            `[${buscado.tracks[0].info.title}](${buscado.tracks[0].info.uri})`
          );
          embedCanciónAñadida.addField(
            "Autor",
            buscado.tracks[0].info.author,
            true
          );
          if (reproductor.queue.totalSize > 1)
            embedCanciónAñadida.addField(
              "Posición en cola",
              `${reproductor.queue.size - 0}`,
              true
            );
          buscando.edit(embedCanciónAñadida);
        } else {
          return cliente.sendTime(
            mensaje.channel,
            "**No se encontraron coincidencias para - **" + cadenaDeBusqueda
          );
        }
      } else {
        let buscado = await reproductor.search(cadenaDeBusqueda, mensaje.author);
        if (!reproductor)
          return cliente.sendTime(
            mensaje.channel,
            "❌ | **Nada se está reproduciendo en este momento...**"
          );

        if (buscado.loadType === "NO_MATCHES")
          return cliente.sendTime(
            mensaje.channel,
            "❌ | **No se encontraron resultados para - **" + cadenaDeBusqueda
          );
        else if (buscado.loadType == "PLAYLIST_LOADED") {
          reproductor.queue.add(buscado.tracks);
          if (
            !reproductor.playing &&
            !reproductor.paused &&
            reproductor.queue.totalSize === buscado.tracks.length
          )
            reproductor.play();
          embedCanciónAñadida.setAuthor(
            `Lista de reproducción añadida a la cola`,
            cliente.botconfig.IconURL
          );
          embedCanciónAñadida.setDescription(
            `[${buscado.playlist.name}](${cadenaDeBusqueda})`
          );
          embedCanciónAñadida.addField(
            "En cola",
            `\`${buscado.tracks.length}\` canciones`,
            false
          );
          embedCanciónAñadida.addField(
            "Duración de la lista de reproducción",
            `\`${prettyMilliseconds(buscado.playlist.duration, {
              colonNotation: true,
            })}\``,
            false
          );
          buscando.edit(embedCanciónAñadida);
        } else {
          reproductor.queue.add(buscado.tracks[0]);
          if (!reproductor.playing && !reproductor.paused && !reproductor.queue.size)
            reproductor.play();
          embedCanciónAñadida.setAuthor(`Añadida a la cola`, cliente.botconfig.IconURL);

          embedCanciónAñadida.setDescription(
            `[${buscado.tracks[0].title}](${buscado.tracks[0].uri})`
          );
          embedCanciónAñadida.addField("Autor", buscado.tracks[0].author, true);

          if (buscado.tracks[0].duration == 9223372036854776000) {
            d = "En vivo";
          } else {
          d = prettyMilliseconds(buscado.tracks[0].duration, {
            colonNotation: true,
          });
          }

          embedCanciónAñadida.addField("Duración", `\`${d}\``, true);

          if (reproductor.queue.totalSize > 1)
            embedCanciónAñadida.addField(
              "Posición en cola",
              `${reproductor.queue.size - 0}`,
              true
            );
          buscando.edit(embedCanciónAñadida);
        }
      }
    } catch (e) {
      console.log(e);
      return cliente.sendTime(
        mensaje.channel,
        "**No se encontraron coincidencias para - **" + cadenaDeBusqueda
      );
    }
  },
  // ... (Puedes dejar el código restante sin traducir, ya que ya se encuentra arriba)
};

