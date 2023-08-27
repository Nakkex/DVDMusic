const { MessageEmbed } = require("discord.js");
const { TrackUtils, Player } = require("erela.js");

module.exports = {
  name: "saltarhasta",
  description: "Saltar hasta una canción en la cola",
  usage: "<número>",
  permissions: {
    channel: ["VER_CANAL", "ENVIAR_MENSAJES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["st"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    const player = client.Manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: client.botconfig.ServerDeafen,
    });

    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **No se está reproduciendo nada en este momento...**"
      );
    if (!message.member.voice.channel)
      return client.sendTime(
        message.channel,
        "❌ | **Debes estar en un canal de voz para usar este comando.**"
      );
    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        "❌ | **Debes estar en el mismo canal de voz que yo para usar este comando.**"
      );

    try {
      if (!args[0])
        return client.sendTime(
          message.channel,
          `**Uso**: \`${GuildDB.prefix}saltarhasta [número]\``
        );
      // Si el número de la canción deseada es mayor que el tamaño de la cola
      if (Number(args[0]) > player.queue.size)
        return client.sendTime(
          message.channel,
          "❌ | ¡Esa canción no está en la cola! ¡Por favor, inténtalo de nuevo!"
        );
      // Elimina todas las canciones hasta la canción deseada
      player.queue.remove(0, Number(args[0]) - 1);
      // Detiene al reproductor
      player.stop();
      // Envia mensaje de éxito
      return client.sendTime(
        message.channel,
        `⏭ Saltado \`${Number(args[0] - 1)}\` canciones`
      );
    } catch (e) {
      console.log(String(e.stack).bgRed);
      client.sendError(message.channel, "Algo salió mal.");
    }
  },
  SlashCommand: {
    options: [
      {
        name: "posición",
        value: "[posición]",
        type: 4,
        required: true,
        description: "Saltar hasta una canción específica en la cola",
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
      });

      try {
        if (!interaction.data.options)
          return client.sendTime(
            interaction,
            `**Uso**: \`${GuildDB.prefix}saltarhasta <número>\``
          );
        let saltarHasta = interaction.data.options[0].value;
        // Si el número de la canción deseada es inválido
        if (
          saltarHasta !== null &&
          (isNaN(saltarHasta) || saltarHasta < 1 || saltarHasta > player.queue.length)
        )
          return client.sendTime(
            interaction,
            "❌ | ¡Esa canción no está en la cola! ¡Por favor, inténtalo de nuevo!"
          );

        player.stop(saltarHasta);
        // Envia mensaje de éxito
        return client.sendTime(
          interaction,
          `⏭ Saltado \`${Number(saltarHasta)}\` canciones`
        );
      } catch (e) {
        console.log(String(e.stack).bgRed);
        client.sendError(interaction, "Algo salió mal.");
      }
    },
  },
};
