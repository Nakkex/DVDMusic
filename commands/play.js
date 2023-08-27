const { Util, MessageEmbed } = require("discord.js");
const { TrackUtils, Player } = require("erela.js");
const prettyMilliseconds = require("pretty-ms");
let d;

module.exports = {
  name: "play",
  description: "Reproduce tus canciones favoritas",
  usage: "[canción]",
  permissions: {
    channel: ["VER_CANAL", "ENVIAR_MENSAJES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["p"],
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
        "❌ | **Debes estar en un canal de voz para reproducir algo.**"
      );
    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        "❌ | **Debes estar en el mismo canal de voz que yo para usar este comando.**"
      );
    let SearchString = args.join(" ");
    if (!SearchString)
      return client.sendTime(
        message.channel,
        `**Uso - **\`${GuildDB.prefix}play [canción]\``
      );
    let CheckNode = client.Manager.nodes.get(client.botconfig.Lavalink.id);
    let Searching = await message.channel.send(":mag_right: Buscando...");
    if (!CheckNode || !CheckNode.connected) {
      return client.sendTime(
        message.channel,
        "❌ | **Nodo de Lavalink no conectado**"
      );
    }
    const player = client.Manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: client.botconfig.ServerDeafen,
      volume: client.botconfig.DefaultVolume,
    });

    let EmbedCanciónAñadida = new MessageEmbed().setColor(
      client.botconfig.EmbedColor
    );

    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Nada se está reproduciendo en este momento...**"
      );

    if (player.state != "CONNECTED") await player.connect();

    try {
      if (SearchString.match(client.Lavasfy.spotifyPattern)) {
        await client.Lavasfy.requestToken();
        let node = client.Lavasfy.nodes.get(client.botconfig.Lavalink.id);
        let Searched = await node.load(SearchString);

        if (Searched.loadType === "PLAYLIST_LOADED") {
          let canciones = [];
          for (let i = 0; i < Searched.tracks.length; i++)
            canciones.push(TrackUtils.build(Searched.tracks[i], message.author));
          player.queue.add(canciones);
          if (
            !player.playing &&
            !player.paused &&
            player.queue.totalSize === Searched.tracks.length
          )
            player.play();
          EmbedCanciónAñadida.setAuthor(
            `Lista de reproducción añadida a la cola`,
            message.author.displayAvatarURL()
          );
          EmbedCanciónAñadida.addField(
            "En cola",
            `\`${Searched.tracks.length}\` canciones`,
            false
          );
          //EmbedCanciónAñadida.addField("Duración de la lista", `\`${prettyMilliseconds(Searched.tracks, { colonNotation: true })}\``, false)
          Searching.edit(EmbedCanciónAñadida);
        } else if (Searched.loadType.startsWith("TRACK")) {
          player.queue.add(
            TrackUtils.build(Searched.tracks[0], message.author)
          );
          if (!player.playing && !player.paused && !player.queue.size)
            player.play();
          EmbedCanciónAñadida.setAuthor(`Añadida a la cola`, client.botconfig.IconURL);
          EmbedCanciónAñadida.setDescription(
            `[${Searched.tracks[0].info.title}](${Searched.tracks[0].info.uri})`
          );
          EmbedCanciónAñadida.addField(
            "Autor",
            Searched.tracks[0].info.author,
            true
          );
          //EmbedCanciónAñadida.addField("Duración", `\`${prettyMilliseconds(Searched.tracks[0].length, { colonNotation: true })}\``, true);
          if (player.queue.totalSize > 1)
            EmbedCanciónAñadida.addField(
              "Posición en la cola",
              `${player.queue.size - 0}`,
              true
            );
          Searching.edit(EmbedCanciónAñadida);
        } else {
          return client.sendTime(
            message.channel,
            "**No se encontraron coincidencias para - **" + SearchString
          );
        }
      } else {
        let Searched = await player.search(SearchString, message.author);
        if (!player)
          return client.sendTime(
            message.channel,
            "❌ | **Nada se está reproduciendo en este momento...**"
          );

        if (Searched.loadType === "NO_MATCHES")
          return client.sendTime(
            message.channel,
            "❌ | **No se encontraron coincidencias para - **" + SearchString
          );
        else if (Searched.loadType == "PLAYLIST_LOADED") {
          player.queue.add(Searched.tracks);
          if (
            !player.playing &&
            !player.paused &&
            player.queue.totalSize === Searched.tracks.length
          )
            player.play();
          EmbedCanciónAñadida.setAuthor(
            `Lista de reproducción añadida a la cola`,
            client.botconfig.IconURL
          );
          // EmbedCanciónAñadida.setThumbnail(Searched.tracks[0].displayThumbnail());
          EmbedCanciónAñadida.setDescription(
            `[${Searched.playlist.name}](${SearchString})`
          );
          EmbedCanciónAñadida.addField(
            "En cola",
            `\`${Searched.tracks.length}\` canciones`,
            false
          );
          EmbedCanciónAñadida.addField(
            "Duración de la lista",
            `\`${prettyMilliseconds(Searched.playlist.duration, {
              colonNotation: true,
            })}\``,
            false
          );
          Searching.edit(EmbedCanciónAñadida);
        } else {
          player.queue.add(Searched.tracks[0]);
          if (!player.playing && !player.paused && !player.queue.size)
            player.play();
          EmbedCanciónAñadida.setAuthor(`Añadida a la cola`, client.botconfig.IconURL);

          // EmbedCanciónAñadida.setThumbnail(Searched.tracks[0].displayThumbnail());
          EmbedCanciónAñadida.setDescription(
            `[${Searched.tracks[0].title}](${Searched.tracks[0].uri})`
          );
          EmbedCanciónAñadida.addField("Autor", Searched.tracks[0].author, true);

          // Comprueba si la duración coincide con la duración de una transmisión en vivo
          if (Searched.tracks[0].duration == 9223372036854776000) {
            d = "En vivo";
          } else {
            d = prettyMilliseconds(Searched.tracks[0].duration, {
              colonNotation: true,
            });
          }

          EmbedCanciónAñadida.addField("Duración", `\`${d}\``, true);

          if (player.queue.totalSize > 1)
            EmbedCanciónAñadida.addField(
              "Posición en la cola",
              `${player.queue.size - 0}`,
              true
            );
          Searching.edit(EmbedCanciónAñadida);
        }
      }
    } catch (e) {
      console.log(e);
      return client.sendTime(
        message.channel,
        "**No se encontraron coincidencias para - **" + SearchString
      );
    }
  },

  SlashCommand: {
    options: [
      {
        name: "canción",
        value: "canción",
        type: 3,
        required: true,
        description: "Reproduce música en el canal de voz",
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
      let awaitchannel = client.channels.cache.get(interaction.channel_id);
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
          "❌ | **Debes estar en el mismo canal de voz que yo para usar este comando.**"
        );
      let CheckNode = client.Manager.nodes.get(client.botconfig.Lavalink.id);
      if (!CheckNode || !CheckNode.connected) {
        return client.sendTime(
          interaction,
          "❌ | **Nodo de Lavalink no conectado**"
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
        let Searched = await node.load(búsqueda);

        switch (Searched.loadType) {
          case "LOAD_FAILED":
            if (!player.queue.current) player.destroy();
            return client.sendError(
              interaction,
              `❌ | **Hubo un error al buscar**`
            );

          case "NO_MATCHES":
            if (!player.queue.current) player.destroy();
            return client.sendTime(
              interaction,
              "❌ | **No se encontraron resultados.**"
            );
          case "TRACK_LOADED":
            player.queue.add(TrackUtils.build(Searched.tracks[0], member.user));
            if (!player.playing && !player.paused && !player.queue.length)
              player.play();
            let CanciónAñadidaEmbed = new MessageEmbed();
            CanciónAñadidaEmbed.setAuthor(
              `Añadida a la cola`,
              client.botconfig.IconURL
            );
            CanciónAñadidaEmbed.setColor(client.botconfig.EmbedColor);
            CanciónAñadidaEmbed.setDescription(
              `[${Searched.tracks[0].info.title}](${Searched.tracks[0].info.uri})`
            );
            CanciónAñadidaEmbed.addField(
              "Autor",
              Searched.tracks[0].info.author,
              true
            );
            if (player.queue.totalSize > 1)
              CanciónAñadidaEmbed.addField(
                "Posición en la cola",
                `${player.queue.size - 0}`,
                true
              );
            return interaction.send(CanciónAñadidaEmbed);

          case "PLAYLIST_LOADED":
            let canciones = [];
            for (let i = 0; i < Searched.tracks.length; i++)
              canciones.push(TrackUtils.build(Searched.tracks[i], member.user));
            player.queue.add(canciones);
            if (
              !player.playing &&
              !player.paused &&
              player.queue.totalSize === Searched.tracks.length
            )
              player.play();
            let ListaReproducción = new MessageEmbed();
            ListaReproducción.setAuthor(
              `Lista de reproducción añadida a la cola`,
              client.botconfig.IconURL
            );
            ListaReproducción.setDescription(
          player.queue.add(Searched.tracks);
          if (
            !player.playing &&
            !player.paused &&
            player.queue.totalSize === Searched.tracks.length
          )
            player.play();
          EmbedCanciónAñadida.setAuthor(
            `Lista de reproducción añadida a la cola`,
            client.botconfig.IconURL
          );
          // EmbedCanciónAñadida.setThumbnail(Searched.tracks[0].displayThumbnail());
          EmbedCanciónAñadida.setDescription(
            `[${Searched.playlist.name}](${SearchString})`
          );
          EmbedCanciónAñadida.addField(
            "En cola",
            `\`${Searched.tracks.length}\` canciones`,
            false
          );
          EmbedCanciónAñadida.addField(
            "Duración de la lista",
            `\`${prettyMilliseconds(Searched.playlist.duration, {
              colonNotation: true,
            })}\``,
            false
          );
          Searching.edit(EmbedCanciónAñadida);
        } else {
          player.queue.add(Searched.tracks[0]);
          if (!player.playing && !player.paused && !player.queue.size)
            player.play();
          EmbedCanciónAñadida.setAuthor(`Añadida a la cola`, client.botconfig.IconURL);

          // EmbedCanciónAñadida.setThumbnail(Searched.tracks[0].displayThumbnail());
          EmbedCanciónAñadida.setDescription(
            `[${Searched.tracks[0].title}](${Searched.tracks[0].uri})`
          );
          EmbedCanciónAñadida.addField("Autor", Searched.tracks[0].author, true);

          // Comprueba si la duración coincide con la duración de una transmisión en vivo
          if (Searched.tracks[0].duration == 9223372036854776000) {
            d = "En vivo";
          } else {
            d = prettyMilliseconds(Searched.tracks[0].duration, {
              colonNotation: true,
            });
          }

          EmbedCanciónAñadida.addField("Duración", `\`${d}\``, true);

          if (player.queue.totalSize > 1)
            EmbedCanciónAñadida.addField(
              "Posición en la cola",
              `${player.queue.size - 0}`,
              true
            );
          Searching.edit(EmbedCanciónAñadida);
        }
      }
    } catch (e) {
      console.log(e);
      return client.sendTime(
        message.channel,
        "**No se encontraron coincidencias para - **" + SearchString
      );
    }
  },

  SlashCommand: {
    options: [
      {
        name: "canción",
        value: "canción",
        type: 3,
        required: true,
        description: "Reproduce música en el canal de voz",
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
      let awaitchannel = client.channels.cache.get(interaction.channel_id);
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
          "❌ | **Debes estar en el mismo canal de voz que yo para usar este comando.**"
        );
      let CheckNode = client.Manager.nodes.get(client.botconfig.Lavalink.id);
      if (!CheckNode || !CheckNode.connected) {
        return client.sendTime(
          interaction,
          "❌ | **Nodo de Lavalink no conectado**"
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
        let Searched = await node.load(búsqueda);

        switch (Searched.loadType) {
          case "LOAD_FAILED":
            if (!player.queue.current) player.destroy();
            return client.sendError(
              interaction,
              `❌ | **Hubo un error al buscar**`
            );

          case "NO_MATCHES":
            if (!player.queue.current) player.destroy();
            return client.sendTime(
              interaction,
              "❌ | **No se encontraron resultados.**"
            );
          case "TRACK_LOADED":
            player.queue.add(TrackUtils.build(Searched.tracks[0], member.user));
            if (!player.playing && !player.paused && !player.queue.length)
              player.play();
            let CanciónAñadidaEmbed = new MessageEmbed();
            CanciónAñadidaEmbed.setAuthor(
              `Añadida a la cola`,
              client.botconfig.IconURL
            );
            CanciónAñadidaEmbed.setColor(client.botconfig.EmbedColor);
            CanciónAñadidaEmbed.setDescription(
              `[${Searched.tracks[0].info.title}](${Searched.tracks[0].info.uri})`
            );
            CanciónAñadidaEmbed.addField(
              "Autor",
              Searched.tracks[0].info.author,
              true
            );
            if (player.queue.totalSize > 1)
              CanciónAñadidaEmbed.addField(
                "Posición en la cola",
                `${player.queue.size - 0}`,
                true
              );
            return interaction.send(CanciónAñadidaEmbed);

          case "PLAYLIST_LOADED":
            let canciones = [];
            for (let i = 0; i < Searched.tracks.length; i++)
              canciones.push(TrackUtils.build(Searched.tracks[i], member.user));
            player.queue.add(canciones);
            if (
              !player.playing &&
              !player.paused &&
              player.queue.totalSize === Searched.tracks.length
            )
              player.play();
            let ListaReproducción = new MessageEmbed();
            ListaReproducción.setAuthor(
              `Lista de reproducción añadida a la cola`,
              client.botconfig.IconURL
            );
            ListaReproducción.setDescription(
              `[${Searched.playlistInfo.name}](${interaction.data.options[
