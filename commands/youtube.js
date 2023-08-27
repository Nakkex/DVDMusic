const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "youtube",
  description: "Inicia una sesión de YouTube Together",
  usage: "",
  permissions: {
    channel: ["VER_CANAL", "ENVIAR_MENSAJES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["yt"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {require("discord.js").Message} message
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
      !message.member.voice.channel
        .permissionsFor(message.guild.me)
        .has("CREATE_INSTANT_INVITE")
    )
      return client.sendTime(
        message.channel,
        "❌ | **El bot no tiene el permiso para crear invitaciones.**"
      );

    let Invite = await message.member.voice.channel.activityInvite(
      "880218394199220334"
    ); // Hecho usando el paquete discordjs-activity
    let embed = new MessageEmbed()
      .setAuthor(
        "YouTube Together",
        "https://cdn.discordapp.com/emojis/749289646097432667.png?v=1"
      )
      .setColor("#FF0000").setDescription(`
Usando **YouTube Together** puedes ver videos de YouTube con tus amigos en un canal de voz. ¡Haz clic en *Unirse a YouTube Together* para unirte!

__**[Unirse a YouTube Together](https://discord.com/invite/${Invite.code})**__

⚠ **Nota:** Esto solo funciona en la versión de escritorio
`);
    message.channel.send(embed);
  },
  SlashCommand: {
    options: [],
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
        !member.voice.channel
          .permissionsFor(guild.me)
          .has("CREATE_INSTANT_INVITE")
      )
        return client.sendTime(
          interaction,
          "❌ | **El bot no tiene el permiso para crear invitaciones.**"
        );

      let Invite = await member.voice.channel.activityInvite(
        "755600276941176913"
      ); // Hecho usando el paquete discordjs-activity
      let embed = new MessageEmbed()
        .setAuthor(
          "YouTube Together",
          "https://cdn.discordapp.com/emojis/749289646097432667.png?v=1"
        )
        .setColor("#FF0000").setDescription(`
Usando **YouTube Together** puedes ver videos de YouTube con tus amigos en un canal de voz. ¡Haz clic en *Unirse a YouTube Together* para unirte!

__**[Unirse a YouTube Together](https://discord.com/invite/${Invite.code})**__

⚠ **Nota:** Esto solo funciona en la versión de escritorio
`);
      interaction.send(embed.toJSON());
    },
  },
};
