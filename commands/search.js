const { MessageEmbed, Message } = require("discord.js");
const { TrackUtils } = require("erela.js");
const _ = require("lodash");
const prettyMilliseconds = require("pretty-ms");

module.exports = {
  name: "search",
  description: "Muestra resultados de canciones basados en la búsqueda",
  usage: "[canción]",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["se"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    if (!message.member.voice.channel)
      return client.sendTime(
        message.channel,
        "❌ | **¡Debes estar en un canal de voz para reproducir algo!**"
      );
    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        "❌ | **¡Debes estar en el mismo canal de voz que yo para usar este comando!**"
      );

    let CadenaBusqueda = args.join(" ");
    if (!CadenaBusqueda)
      return client.sendTime(
        message.channel,
        `**Uso - **\`${GuildDB.prefix}search [consulta]\``
      );
    let NodoVerificado = client.Manager.nodes.get(client.botconfig.Lavalink.id);
    if (!NodoVerificado || !NodoVerificado.connected) {
      return client.sendTime(
        message.channel,
        "❌ | **Nodo Lavalink no conectado**"
      );
    }
    const player = client.Manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: client.botconfig.ServerDeafen,
      volume: client.botconfig.DefaultVolume,
    });

    if (player.state != "CONNECTED") await player.connect();

    let Buscado = await player.search(CadenaBusqueda, message.author);
    if (Buscado.loadType == "NO_MATCHES")
      return client.sendTime(
        message.channel,
        "No se encontraron coincidencias para " + CadenaBusqueda
      );
    else {
      Buscado.tracks = Buscado.tracks.map((s, i) => {
        s.index = i;
        return s;
      });
      let canciones = _.chunk(Buscado.tracks, 10);
      let Páginas = canciones.map((cancionesChunk) => {
        let CancionesMapeadas = cancionesChunk.map(
          (c) =>
            `\`${c.index + 1}.\` [${c.title}](${
              c.uri
            }) \nDuración: \`${prettyMilliseconds(c.duration, {
              colonNotation: true,
            })}\``
        );

        let em = new MessageEmbed()
          .setAuthor(
            "Resultados de búsqueda de " + CadenaBusqueda,
            client.botconfig.IconURL
          )
          .setColor(client.botconfig.EmbedColor)
          .setDescription(CancionesMapeadas.join("\n\n"));
        return em;
      });

      if (!Páginas.length || Páginas.length === 1)
        return message.channel.send(Páginas[0]);
      else client.Pagination(message, Páginas);

      let w = (a) => new Promise((r) => setInterval(r, a));
      await w(500); // Espera 500ms porque es necesario esperar a que se envíe el embed de búsqueda de canciones anterior.
      let msg = await message.channel.send(
        "**Escribe el número de la canción que deseas reproducir. Expira en `30 segundos`.**"
      );

      let er = false;
      let IDCancion = await message.channel
        .awaitMessages((msg) => message.author.id === msg.author.id, {
          max: 1,
          errors: ["time"],
          time: 30000,
        })
        .catch(() => {
          er = true;
          msg.edit(
            "**Te tomaste demasiado tiempo para responder. Ejecuta el comando nuevamente si deseas reproducir algo.**"
          );
        });
      if (er) return;
      /**@type {Message} */
      let MensajeIDCancion = IDCancion.first();

      if (!parseInt(MensajeIDCancion.content))
        return client.sendTime(
          message.channel,
          "Por favor, envía el número correcto de identificación de canción"
        );
      let Cancion = Buscado.tracks[parseInt(MensajeIDCancion.content) - 1];
      if (!Cancion)
        return client.sendTime(
          message.channel,
          "No se encontró ninguna canción para el ID proporcionado"
        );
      player.queue.add(Cancion);
      if (!player.playing && !player.paused && !player.queue.size)
        player.play();
      let EmbedCancionAñadida = new MessageEmbed();
      EmbedCancionAñadida.setAuthor(`Añadido a la cola`, client.botconfig.IconURL);
      EmbedCancionAñadida.setThumbnail(Cancion.displayThumbnail());
      EmbedCancionAñadida.setColor(client.botconfig.EmbedColor);
      EmbedCancionAñadida.setDescription(`[${Cancion.title}](${Cancion.uri})`);
      EmbedCancionAñadida.addField("Autor", `${Cancion.author}`, true);
      EmbedCancionAñadida.addField(
        "Duración",
        `\`${prettyMilliseconds(player.queue.current.duration, {
          colonNotation: true,
        })}\``,
        true
      );
      if (player.queue.totalSize > 1)
        EmbedCancionAñadida.addField(
          "Posición en la cola",
          `${player.queue.size - 0}`,
          true
        );
      message.channel.send(EmbedCancionAñadida);
    }
  },

  SlashCommand: {
    options: [
      {
        name: "cancion",
        value: "cancion",
        type: 3,
        required: true,
        description: "Ingresa el nombre de la canción o la URL que deseas buscar",
      },
    ],
    /**
     *
     * @param {import("../structures/DiscordMusicBot")} client
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     * @param {*} param3
     */
    run: async (client, interaction, args, { GuildDB }) => {
      const guild = client.guilds.cache.get(interaction.guild_id);
      const member = guild.members.cache.get(interaction.member.user.id);
      const voiceChannel = member.voice.channel;
      let canalEspera = client.channels.cache.get(interaction.channel_id);
/// gracias Reyansh por esta idea ;-;
      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | **Debes estar en un canal de voz para usar este comando.**"
        );
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          "❌ | **¡Debes estar en el mismo canal de voz que yo para usar este comando!**"
        );
      let NodoVerificado = client.Manager.nodes.get(client.botconfig.Lavalink.id);
      if (!NodoVerificado || !NodoVerificado.connected) {
        return client.sendTime(
          interaction,
          "❌ | **Nodo Lavalink no conectado**"
        );
      }
      let player = client.Manager.create({
        guild: interaction.guild_id,
        voiceChannel: voiceChannel.id,
        textChannel: interaction.channel_id,
        selfDeafen: client.botconfig.ServerDeafen,
        volume: client.botconfig.DefaultVolume,
      });
      if (player.state != "CONNECTED") await player.connect();
      let búsqueda = interaction.data.options[0].value;
      let res;

      if (búsqueda.match(client.Lavasfy.spotifyPattern)) {
        await client.Lavasfy.requestToken();
        let node = client.Lavasfy.nodes.get(client.botconfig.Lavalink.id);
        let Buscado = await node.load(búsqueda);

        switch (Buscado.loadType) {
          case "LOAD_FAILED":
            if (!player.queue.current) player.destroy();
            return client.sendError(
              interaction,
              `❌ | **Ocurrió un error durante la búsqueda**`
            );

          case "NO_MATCHES":
            if (!player.queue.current) player.destroy();
            return client.sendTime(
              interaction,
              "❌ | **No se encontraron resultados**"
            );
          case "TRACK_LOADED":
            player.queue.add(TrackUtils.build(Buscado.tracks[0], member.user));
            if (!player.playing && !player.paused && !player.queue.length)
              player.play();
            return client.sendTime(
              interaction,
              `**Añadido a la cola:** \`[${Buscado.tracks[0].info.title}](${Buscado.tracks[0].info.uri}}\`.`
            );

          case "PLAYLIST_LOADED":
            let canciones = [];
            for (let i = 0; i < Buscado.tracks.length; i++)
              canciones.push(TrackUtils.build(Buscado.tracks[i], member.user));
            player.queue.add(canciones);

            if (
              !player.playing &&
              !player.paused &&
              player.queue.totalSize === Buscado.tracks.length
            )
              player.play();
            return client.sendTime(
              interaction,
              `**Lista de reproducción añadida a la cola**: \n**${Buscado.playlist.name}** \nEn cola: **${Buscado.playlistInfo.length} canciones**`
            );
        }
      } else {
        try {
          res = await player.search(búsqueda, member.user);
          if (res.loadType === "LOAD_FAILED") {
            if (!player.queue.current) player.destroy();
            throw new Error(res.exception.message);
          }
        } catch (err) {
          return client.sendTime(
            interaction,
            `❌ | **Ocurrió un error durante la búsqueda:** ${err.message}`
          );
        }
        switch (res.loadType) {
          case "NO_MATCHES":
            if (!player.queue.current) player.destroy();
            return client.sendTime(
              interaction,
              "❌ | **No se encontraron resultados**"
            );
          case "TRACK_LOADED":
            player.queue.add(res.tracks[0]);
            if (!player.playing && !player.paused && !player.queue.length)
              player.play();
            return client.sendTime(
              interaction,
              `**Añadido a la cola:** \`[${res.tracks[0].title}](${res.tracks[0].uri})\`.`
            );
          case "PLAYLIST_LOADED":
            player.queue.add(res.tracks);

            if (
              !player.playing &&
              !player.paused &&
              player.queue.size === res.tracks.length
            )
              player.play();
            return client.sendTime(
              interaction,
              `**Lista de reproducción añadida a la cola**: \n**${res.playlist.name}** \nEn cola: **${res.playlistInfo.length} canciones**`
            );
          case "SEARCH_RESULT":
            let max = 10,
              collected,
              filter = (m) =>
                m.author.id === interaction.member.user.id &&
                /^(\d+|end)$/i.test(m.content);
            if (res.tracks.length < max) max = res.tracks.length;

            const resultados = res.tracks
              .slice(0, max)
              .map(
                (canción, index) =>
                  `\`${++index}\` - [${canción.title}](${
                    canción.uri
                  }) \n\t\`${prettyMilliseconds(canción.duration, {
                    colonNotation: true,
                  })}\`\n`
              )
              .join("\n");

            const resultadosEmbed = new MessageEmbed()
              .setDescription(
                `${resultados}\n\n\t**Escribe el número de la canción que deseas reproducir.**\n`
              )
              .setColor(client.botconfig.EmbedColor)
              .setAuthor(
                `Resultados de búsqueda para ${búsqueda}`,
                client.botconfig.IconURL
              );
            interaction.send(resultadosEmbed);
            try {
              collected = await canalEspera.awaitMessages(filter, {
                max: 1,
                time: 30e3,
                errors: ["time"],
              });
            } catch (e) {
              if (!player.queue.current) player.destroy();
              return canalEspera.send(
                "❌ | **No proporcionaste una selección**"
              );
            }

            const primero = collected.first().content;

            if (primero.toLowerCase() === "cancelar") {
              if (!player.queue.current) player.destroy();
              return canalEspera.send("Búsqueda cancelada.");
            }

            const índice = Number(primero) - 1;
            if (índice < 0 || índice > max - 1)
              return canalEspera.send(
                `El número que proporcionaste fue mayor o menor que el total de la búsqueda. Uso - \`(1-${max})\``
              );
            const pista = res.tracks[índice];
            player.queue.add(pista);

            if (!player.playing && !player.paused && !player.queue.length) {
              player.play();
            } else {
              let embedCanciónAñadida = new MessageEmbed();
              embedCanciónAñadida.setAuthor(
                `Añadido a la cola`,
                client.botconfig.IconURL
              );
              embedCanciónAñadida.setThumbnail(pista.displayThumbnail());
              embedCanciónAñadida.setColor(client.botconfig.EmbedColor);
              embedCanciónAñadida.setDescription(`[${pista.title}]
(${pista.uri})`);
              embedCanciónAñadida.addField("Autor", pista.author, true);
              embedCanciónAñadida.addField(
                "Duración",
                `\`${prettyMilliseconds(pista.duration, {
                  colonNotation: true,
                })}\``,
                true
              );
              if (player.queue.totalSize > 1)
                embedCanciónAñadida.addField(
                  "Posición en la cola",
                  `${player.queue.size - 0}`,
                  true
                );
              canalEspera.send(embedCanciónAñadida);
            }
        }
      }
    },
  },
};
