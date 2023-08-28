const { MessageEmbed } = require("discord.js");
const { TrackUtils } = require("erela.js");

module.exports = {
  name: "loopcola",
  description: "Repetir toda la cola de reproducción",
  usage: "",
  permissions: {
    channel: ["VER_CANAL", "ENVIAR_MENSAJES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["lq", "repeatqueue", "rq"],
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

    if (player.queueRepeat) {
      player.setQueueRepeat(false);
      client.sendTime(message.channel, `:repeat: Repetición de la cola desactivada`);
    } else {
      player.setQueueRepeat(true);
      client.sendTime(message.channel, `:repeat: Repetición de la cola activada`);
    }
  },
  SlashCommand: {
    /**
     *
     * @param {import("../structures/DiscordMusicBot")} client
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     * @param {*} param3
     */
    run: async (client, interaction, args, { GuildDB }) => {
      let player = await client.Manager.get(interaction.guild_id);
      const guild = client.guilds.cache.get(interaction.guild_id);
      const member = guild.members.cache.get(interaction.member.user.id);
      const voiceChannel = member.voice.channel;
      let awaitchannel = client.channels.cache.get(interaction.channel_id); /// gracias Reyansh por esta idea ;-;
      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nada se está reproduciendo en este momento...**"
        );
      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | Debes estar en un canal de voz para usar este comando."
        );
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(voiceChannel)
      )
        return client.sendTime(
          interaction,
          "❌ | **Debes estar en el mismo canal de voz que yo para usar este comando.**"
        );

      if (player.queueRepeat) {
        player.setQueueRepeat(false);
        client.sendTime(interaction, `:repeat: **Repetición de la cola** desactivada`);
      } else {
        player.setQueueRepeat(true);
        client.sendTime(interaction, `:repeat: **Repetición de la cola** activada`);
      }
      console.log(interaction.data);
    },
  },
};
