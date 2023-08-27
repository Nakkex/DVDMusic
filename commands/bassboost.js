const { MessageEmbed } = require("discord.js");
const { TrackUtils } = require("erela.js");
const levels = {
  none: 0.0,
  low: 0.2,
  medium: 0.3,
  high: 0.35,
};
module.exports = {
  name: "bassboost",
  description: "Activa el efecto de aumento de graves",
  usage: "<ninguno|bajo|medio|alto>",
  permissions: {
    channel: ["VER_CANAL", "ENVIAR_MENSAJES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["bb", "grave"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    let player = await client.Manager.get(message.guild.id);
    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Nada se está reproduciendo en este momento...**"
      );
    if (!message.member.voice.channel)
      return client.sendTime(
        message.channel,
        "❌ | **¡Debes estar en un canal de voz para usar este comando!**"
      );
    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        "❌ | **¡Debes estar en el mismo canal de voz que yo para usar este comando!**"
      );

    if (!args[0])
      return client.sendTime(
        message.channel,
        "**Por favor proporciona un nivel de aumento de graves. \nNiveles disponibles:** `ninguno`, `bajo`, `medio`, `alto`"
      );

    let level = "ninguno";
    if (args.length && args[0].toLowerCase() in levels)
      level = args[0].toLowerCase();

    player.setEQ(
      ...new Array(3)
        .fill(null)
        .map((_, i) => ({ banda: i, ganancia: levels[level] }))
    );

    return client.sendTime(
      message.channel,
      `✅ | **Nivel de aumento de graves establecido en** \`${level}\``
    );
  },
  SlashCommand: {
    options: [
      {
        name: "nivel",
        description: `Por favor proporciona un nivel de aumento de graves. Niveles disponibles: bajo, medio, alto o ninguno`,
        value: "[nivel]",
        type: 3,
        required: true,
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
      const levels = {
        ninguno: 0.0,
        bajo: 0.2,
        medio: 0.3,
        alto: 0.35,
      };

      let player = await client.Manager.get(interaction.guild_id);
      const guild = client.guilds.cache.get(interaction.guild_id);
      const member = guild.members.cache.get(interaction.member.user.id);
      const voiceChannel = member.voice.channel;
      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nada se está reproduciendo en este momento...**"
        );
      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | **Debes estar en un canal de voz para usar este comando.**"
        );
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(voiceChannel)
      )
        return client.sendTime(
          interaction,
          "❌ | **¡Debes estar en el mismo canal de voz que yo para usar este comando!**"
        );
      if (!args)
        return client.sendTime(
          interaction,
          "**Por favor proporciona un nivel de aumento de graves. \nNiveles disponibles:** `ninguno`, `bajo`, `medio`, `alto`"
        );

      let level = "ninguno";
      if (args.length && args[0].value in levels) level = args[0].value;

      player.setEQ(
        ...new Array(3)
          .fill(null)
          .map((_, i) => ({ banda: i, ganancia: levels[level] }))
      );

      return client.sendTime(
        interaction,
        `✅ | **Nivel de aumento de graves establecido en** \`${level}\``
      );
    },
  },
};
