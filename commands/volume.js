const { MessageEmbed } = require("discord.js");
const { TrackUtils } = require("erela.js");

module.exports = {
  name: "volumen",
  description: "Verificar o cambiar el volumen actual",
  usage: "<volumen>",
  permissions: {
    channel: ["VER_CANAL", "ENVIAR_MENSAJES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["vol", "v"],
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
    if (!args[0])
      return client.sendTime(
        message.channel,
        `🔉 | Volumen actual \`${player.volume}\`.`
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
    if (!parseInt(args[0]))
      return client.sendTime(
        message.channel,
        `**Por favor, elige un número entre** \`1 - 100\``
      );
    let vol = parseInt(args[0]);
    if (vol < 0 || vol > 100) {
      return client.sendTime(
        message.channel,
        "❌ | **Por favor, elige un número entre `1-100`**"
      );
    } else {
      player.setVolume(vol);
      client.sendTime(
        message.channel,
        `🔉 | **Volumen establecido en** \`${player.volume}\``
      );
    }
  },
  SlashCommand: {
    options: [
      {
        name: "cantidad",
        value: "cantidad",
        type: 4,
        required: false,
        description: "Ingresa un volumen de 1 a 100. El valor predeterminado es 100.",
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

      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | Debes estar en un canal de voz para usar este comando."
        );
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          "❌ | **Debes estar en el mismo canal de voz que yo para usar este comando.**"
        );
      let player = await client.Manager.get(interaction.guild_id);
      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nada se está reproduciendo en este momento...**"
        );
      if (!args[0].value)
        return client.sendTime(
          interaction,
          `🔉 | Volumen actual \`${player.volume}\`.`
        );
      let vol = parseInt(args[0].value);
      if (!vol || vol < 1 || vol > 100)
        return client.sendTime(
          interaction,
          `**Por favor, elige un número entre** \`1 - 100\``
        );
      player.setVolume(vol);
      client.sendTime(interaction, `🔉 | Volumen establecido en \`${player.volume}\``);
    },
  },
};
