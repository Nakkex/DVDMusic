const { MessageEmbed } = require("discord.js");
const prettyMilliseconds = require("pretty-ms");
let d;

module.exports = {
  name: "grab",
  description: "Guarda la canción actual en tus Mensajes Directos",
  usage: "",
  permissions: {
    channel: ["VER_CANAL", "ENVIAR_MENSAJES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["save"],
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
    if (!player.playing)
      return client.sendTime(
        message.channel,
        "❌ | **Nada se está reproduciendo en este momento...**"
      );
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
    let GrabEmbed = new MessageEmbed()
      .setAuthor(
        `Canción guardada`,
        client.user.displayAvatarURL({
          dynamic: true,
        })
      )
      .setThumbnail(
        `https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`
      )
      .setURL(player.queue.current.uri)
      .setColor(client.botconfig.EmbedColor)
      .setTitle(`**${player.queue.current.title}**`);

    // Comprueba si la duración coincide con la duración de una transmisión en vivo

    if (player.queue.current.duration == 9223372036854776000) {
      d = "En vivo";
    } else {
      d = prettyMilliseconds(player.queue.current.duration, {
        colonNotation: true,
      });
    }
    GrabEmbed.addField(`⌛ Duración: `, `\`${d}\``, true)
      .addField(`🎵 Autor: `, `\`${player.queue.current.author}\``, true)
      .addField(
        `▶ Reproducir:`,
        `\`${GuildDB ? GuildDB.prefix : client.botconfig.DefaultPrefix}play ${
          player.queue.current.uri
        }\``
      )
      .addField(`🔎 Guardado en:`, `<#${message.channel.id}>`)
      .setFooter(
        `Solicitado por: ${player.queue.current.requester.tag}`,
        player.queue.current.requester.displayAvatarURL({
          dynamic: true,
        })
      );
    message.author.send(GrabEmbed).catch((e) => {
      return message.channel.send("**❌ Tus mensajes directos están desactivados**");
    });

    client.sendTime(message.channel, "✅ | **¡Revisa tus mensajes directos!**");
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
      const guild = client.guilds.cache.get(interaction.guild_id);
      const user = client.users.cache.get(interaction.member.user.id);
      const member = guild.members.cache.get(interaction.member.user.id);
      let player = await client.Manager.get(interaction.guild_id);
      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nada se está reproduciendo en este momento...**"
        );
      if (!player.playing)
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
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          "❌ | **Debes estar en el mismo canal de voz que yo para usar este comando.**"
        );
      try {
        let embed = new MessageEmbed()
          .setAuthor(`Canción guardada: `, client.user.displayAvatarURL())
          .setThumbnail(
            `https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`
          )
          .setURL(player.queue.current.uri)
          .setColor(client.botconfig.EmbedColor)
          .setTimestamp()
          .setTitle(`**${player.queue.current.title}**`);
        if (player.queue.current.duration == 9223372036854776000) {
          d = "En vivo";
        } else {
          d = prettyMilliseconds(player.queue.current.duration, {
            colonNotation: true,
          });
        }
        embed
          .addField(`⌛ Duración: `, `\`${d}\``, true)
          .addField(`🎵 Autor: `, `\`${player.queue.current.author}\``, true)
          .addField(
            `▶ Reproducir:`,
            `\`${
              GuildDB ? GuildDB.prefix : client.botconfig.DefaultPrefix
            }play ${player.queue.current.uri}\``
          )
          .addField(`🔎 Guardado en:`, `<#${interaction.channel_id}>`)
          .setFooter(
            `Solicitado por: ${player.queue.current.requester.tag}`,
            player.queue.current.requester.displayAvatarURL({
              dynamic: true,
            })
          );
        user.send(embed);
      } catch (e) {
        return client.sendTime(interaction, "**❌ Tus mensajes directos están desactivados**");
      }

      client.sendTime(interaction, "✅ | **¡Revisa tus mensajes directos!**");
    },
  },
};
