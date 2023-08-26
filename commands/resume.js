const { MessageEmbed } = require("discord.js");
const { TrackUtils } = require("erela.js");

module.exports = {
  nombre: "continuar",
  descripción: "Reanuda la música",
  uso: "",
  permisos: {
    canal: ["VER_CANAL", "ENVIAR_MENSAJES", "EMBED_LINKS"],
    miembro: [],
  },
  alias: [],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} cliente
   * @param {import("discord.js").Message} mensaje
   * @param {string[]} args
   * @param {*} param3
   */
  ejecutar: async (cliente, mensaje, args, { GuildDB }) => {
    let reproductor = await cliente.Manager.get(mensaje.guild.id);
    if (!reproductor)
      return cliente.sendTime(
        mensaje.channel,
        "❌ | **Nada se está reproduciendo en este momento...**"
      );
    if (!mensaje.member.voice.channel)
      return cliente.sendTime(
        mensaje.channel,
        "❌ | **¡Debes estar en un canal de voz para usar este comando!**"
      );
    if (
      mensaje.guild.me.voice.channel &&
      mensaje.member.voice.channel.id !== mensaje.guild.me.voice.channel.id
    )
      return cliente.sendTime(
        mensaje.channel,
        "❌ | **¡Debes estar en el mismo canal de voz que yo para usar este comando!**"
      );

    if (reproductor.playing)
      return cliente.sendTime(
        mensaje.channel,
        "❌ | **¡La música ya se está reproduciendo!**"
      );
    reproductor.pause(false);
    await mensaje.react("✅");
  },

  ComandoDeBarra: {
    /**
     *
     * @param {import("../structures/DiscordMusicBot")} cliente
     * @param {import("discord.js").Message} mensaje
     * @param {string[]} args
     * @param {*} param3
     */
    ejecutar: async (cliente, interacción, args, { GuildDB }) => {
      const guild = cliente.guilds.cache.get(interacción.guild_id);
      const miembro = guild.members.cache.get(interacción.member.user.id);

      if (!miembro.voice.channel)
        return cliente.sendTime(
          interacción,
          "❌ | **Debes estar en un canal de voz para usar este comando.**"
        );
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(miembro.voice.channel)
      )
        return cliente.sendTime(
          interacción,
          "❌ | **¡Debes estar en el mismo canal de voz que yo para usar este comando!**"
        );

      let reproductor = await cliente.Manager.get(interacción.guild_id);
      if (!reproductor)
        return cliente.sendTime(
          interacción,
          "❌ | **Nada se está reproduciendo en este momento...**"
        );
      if (reproductor.playing)
        return cliente.sendTime(
          interacción,
          "❌ | **¡La música ya se está reproduciendo!**"
        );
      reproductor.pause(false);
      cliente.sendTime(interacción, "**⏯ ¡Reanudado!**");
    },
  },
};
