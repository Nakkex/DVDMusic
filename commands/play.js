const { Util, MessageEmbed } = require("discord.js");
const { TrackUtils, Player } = require("erela.js");
const prettyMilliseconds = require("pretty-ms");
let d;

module.exports = {
  name: "play",
  description: "Reproduce tus canciones favoritas",
  usage: "[canción]",
  permissions: {
    channel: ["VER_CANAL", "ENVIAR_MENSAJES", "ENLAZAR_INCORPORADO"],
    miembro: [],
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
        "❌ | **¡Debes estar en un canal de voz para reproducir algo!**"
      );
    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        "❌ | **¡Debes estar en el mismo canal de voz para usar este comando!**"
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

    let SongAddedEmbed = new MessageEmbed().setColor(
      client.botconfig.EmbedColor
    );

    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **No se está reproduciendo nada en este momento...**"
      );

    if (player.state != "CONNECTED") await player.connect();

    try {
      if (SearchString.match(client.Lavasfy.spotifyPattern)) {
        await client.Lavasfy.requestToken();
        let node = client.Lavasfy.nodes.get(client.botconfig.Lavalink.id);
        let Searched = await node.load(SearchString);

        if (Searched.loadType === "PLAYLIST_LOADED") {
          let songs = [];
          for (let i = 0; i < Searched.tracks.length; i++)
            songs.push(TrackUtils.build(Searched.tracks[i], message.author));
          player.queue.add(songs);
          if (
            !player.playing &&
            !player.paused &&
            player.queue.totalSize === Searched.tracks.length
          )
            player.play();
          SongAddedEmbed.setAuthor(
            `Lista de reproducción agregada a la cola`,
            message.author.displayAvatarURL()
          );
          SongAddedEmbed.addField(
            "En cola",
            `\`${Searched.tracks.length}\` canciones`,
            false
          );
          //SongAddedEmbed.addField("Duración de la lista", `\`${prettyMilliseconds(Searched.tracks, { colonNotation: true })}\``, false)
          Searching.edit(SongAddedEmbed);
        } else if (Searched.loadType.startsWith("TRACK")) {
          player.queue.add(
            TrackUtils.build(Searched.tracks[0], message.author)
          );
          if (!player.playing && !player.paused && !player.queue.size)
            player.play();
          SongAddedEmbed.setAuthor(`Añadido a la cola`, client.botconfig.IconURL);
          SongAddedEmbed.setDescription(
            `[${Searched.tracks[0].info.title}](${Searched.tracks[0].info.uri})`
          );
          SongAddedEmbed.addField(
            "Autor",
            Searched.tracks[0].info.author,
            true
          );
          //SongAddedEmbed.addField("Duración", `\`${prettyMilliseconds(Searched.tracks[0].length, { colonNotation: true })}\``, true);
          if (player.queue.totalSize > 1)
            SongAddedEmbed.addField(
              "Posición en cola",
              `${player.queue.size - 0}`,
              true
            );
          Searching.edit(SongAddedEmbed);
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
            "❌ | **No se está reproduciendo nada en este momento...**"
          );

        if (Searched.loadType === "NO_MATCHES")
          return client.sendTime(
            message.channel,
            "**No se encontraron coincidencias para - **" + SearchString
          );
        else if (Searched.loadType == "PLAYLIST_LOADED") {
          player.queue.add(Searched.tracks);
          if (
            !player.playing &&
            !player.paused &&
            player.queue.totalSize === Searched.tracks.length
          )
            player.play();
          SongAddedEmbed.setAuthor(
            `Lista de reproducción agregada a la cola`,
            client.botconfig.IconURL
          );
          // SongAddedEmbed.setThumbnail(Searched.tracks[0].displayThumbnail());
          SongAddedEmbed.setDescription(
            `[${Searched.playlist.name}](${SearchString})`
          );
          SongAddedEmbed.addField(
            "En cola",
            `\`${Searched.tracks.length}\` canciones`,
            false
          );
          SongAddedEmbed.addField(
            "Duración de la lista",
            `\`${prettyMilliseconds(Searched.playlist.duration, {
              colonNotation: true,
            })}\``,
            false
          );
          Searching.edit(SongAddedEmbed);
        } else {
          player.queue.add(Searched.tracks[0]);
          if (!player.playing && !player.paused && !player.queue.size)
            player.play();
          SongAddedEmbed.setAuthor(`Añadido a la cola`, client.botconfig.IconURL);

          // SongAddedEmbed.setThumbnail(Searched.tracks[0].displayThumbnail());
          SongAddedEmbed.setDescription(
            `[${Searched.tracks[0].title}](${Searched.tracks[0].uri})`
          );
          SongAddedEmbed.addField("Autor", Searched.tracks[0].author, true);

          // Comprueba si la duración coincide con la duración de una transmisión en vivo
          if (Searched.tracks[0].duration == 9223372036854776000) {
            d = "En vivo";
          }
