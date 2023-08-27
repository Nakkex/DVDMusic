const { MessageEmbed } = require("discord.js");
const { TrackUtils } = require("erela.js");

module.exports = {
  name: "bump",
  description: "Mueve una pista al frente de la cola.",
  usage: "",
  permissions: {
    channel: ["VER_CANAL", "ENVIAR_MENSAJES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["b"],
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
      return client.sendTime(message.channel, "❌ | **Argumentos inválidos.**");

    // Verifica si (args[0] - 1) es un índice válido
    let numPista = parseInt(args[0] - 1);
    if (numPista < 1 || numPista > player.queue.length - 1) {
      return client.sendTime(message.channel, "❌ | **Número de pista inválido.**");
    }

    // Elimina y desplaza el arreglo
    const pista = player.queue[numPista];
    player.queue.splice(numPista, 1);
    player.queue.unshift(pista);
    client.sendTime(
      message.channel,
      "✅ | **" + pista.title + "** ha sido movida al frente de la cola."
    );
  },

  SlashCommand: {
    options: [
      {
        name: "pista",
        value: "pista",
        type: 4,
        required: true,
        description: "Mueve la pista seleccionada al frente de la cola.",
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

      let player = await client.Manager.get(interaction.guild.id);
      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nada se está reproduciendo en este momento...**"
        );
      if (!args[0].value)
        return client.sendTime(interaction, "❌ | **Número de pista inválido.**");

      // Verifica si (args[0] - 1) es un índice válido
      let numPista = parseInt(args[0].value - 1);
      if (numPista < 1 || numPista > player.queue.length - 1) {
        return client.sendTime(interaction, "❌ | **Número de pista inválido.**");
      }

      // Elimina y desplaza el arreglo
      const pista = player.queue[numPista];
      player.queue.splice(numPista, 1);
      player.queue.unshift(pista);
      client.sendTime(
        interaction,
        "✅ | **" +
          player.queue[0].title +
          "** ha sido movida al frente de la cola."
      );
    },
  },
};
