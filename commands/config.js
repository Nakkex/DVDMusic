const { MessageEmbed, MessageReaction } = require("discord.js");

module.exports = {
  name: "config",
  description: "Edita la configuración del bot",
  usage: "",
  permissions: {
    channel: ["VER_CANAL", "ENVIAR_MENSAJES", "EMBED_LINKS"],
    member: ["ADMINISTRADOR"],
  },
  aliases: ["conf"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    let Config = new MessageEmbed()
      .setAuthor("Configuración del Servidor", client.botconfig.IconURL)
      .setColor(client.botconfig.EmbedColor)
      .addField("Prefijo", GuildDB.prefix, true)
      .addField("Rol de DJ", GuildDB.DJ ? `<@&${GuildDB.DJ}>` : "No establecido", true)
      .setDescription(`
¿Qué te gustaría editar?

:one: - Prefijo del Servidor
:two: - Rol de DJ
`);

    let ConfigMessage = await message.channel.send(Config);
    await ConfigMessage.react("1️⃣");
    await ConfigMessage.react("2️⃣");
    let emoji = await ConfigMessage.awaitReactions(
      (reaction, user) =>
        user.id === message.author.id &&
        ["1️⃣", "2️⃣"].includes(reaction.emoji.name),
      { max: 1, errors: ["time"], time: 30000 }
    ).catch(() => {
      ConfigMessage.reactions.removeAll();
      client.sendTime(
        message.channel,
        "❌ | **Has tardado demasiado en responder. Si deseas editar la configuración, ejecuta el comando nuevamente.**"
      );
      ConfigMessage.delete(Config);
    });
    let isOk = false;
    try {
      emoji = emoji.first();
    } catch {
      isOk = true;
    }
    if (isOk) return; // Soy un idiota, lo siento ;-;
    /**@type {MessageReaction} */
    let em = emoji;
    ConfigMessage.reactions.removeAll();
    if (em._emoji.name === "1️⃣") {
      await client.sendTime(
        message.channel,
        "¿A qué prefijo te gustaría cambiar?"
      );
      let prefijo = await message.channel.awaitMessages(
        (msg) => msg.author.id === message.author.id,
        { max: 1, time: 30000, errors: ["time"] }
      );
      if (!prefijo.first())
        return client.sendTime(
          message.channel,
          "Has tardado demasiado en responder."
        );
      prefijo = prefijo.first();
      prefijo = prefijo.content;

      await client.database.guild.set(message.guild.id, {
        prefix: prefijo,
        DJ: GuildDB.DJ,
      });

      client.sendTime(
        message.channel,
        `Prefijo del servidor guardado exitosamente como \`${prefijo}\``
      );
    } else {
      await client.sendTime(
        message.channel,
        "Por favor menciona el rol que deseas que tengan los `DJ`."
      );
      let rol = await message.channel.awaitMessages(
        (msg) => msg.author.id === message.author.id,
        { max: 1, time: 30000, errors: ["time"] }
      );
      if (!rol.first())
        return client.sendTime(
          message.channel,
          "Has tardado demasiado en responder."
        );
      rol = rol.first();
      if (!rol.mentions.roles.first())
        return client.sendTime(
          message.channel,
          "Por favor menciona el rol que deseas para los DJ solamente."
        );
      rol = rol.mentions.roles.first();

      await client.database.guild.set(message.guild.id, {
        prefix: GuildDB.prefix,
        DJ: rol.id,
      });

      client.sendTime(
        message.channel,
        "Rol de DJ guardado exitosamente como <@&" + rol.id + ">"
      );
    }
  },

  SlashCommand: {
    options: [
      {
        name: "prefix",
        description: "Ver el prefijo del bot",
        type: 1,
        required: false,
        options: [
          {
            name: "símbolo",
            description: "Establecer el prefijo del bot",
            type: 3,
            required: false,
          },
        ],
      },
      {
        name: "dj",
        description: "Ver el rol de DJ",
        type: 1,
        required: false,
        options: [
          {
            name: "rol",
            description: "Establecer el rol de DJ",
            type: 8,
            required: false,
          },
        ],
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
      let config = interaction.data.options[0].name;
      let member = await interaction.guild.members.fetch(interaction.user_id);
      //TODO: si no tiene permisos de administrador, retornar...
      if (config === "prefix") {
        // Configuración de prefijo
        if (
          interaction.data.options[0].options &&
          interaction.data.options[0].options[0]
        ) {
          // Tiene prefijo
          let prefijo = interaction.data.options[0].options[0].value;
          await client.database.guild.set(interaction.guild.id, {
            prefix: prefijo,
            DJ: GuildDB.DJ,
          });
          client.sendTime(
            interaction,
            `El prefijo ahora ha sido establecido como \`${prefijo}\``
          );
        } else {
          // No tiene prefijo
          client.sendTime(
            interaction,
            `El prefijo de este servidor es \`${GuildDB.prefix}\``
          );
        }
      } else if (config === "djrole") {
        // Rol de DJ
        if (
          interaction.data.options[0].options &&
          interaction.data.options[0].options[0]
        ) {
          let rol = interaction.guild.roles.cache.get(
            interaction.data.options[0].options[0].value
          );
          await client.database.guild.set(interaction.guild.id, {
            prefix: GuildDB.prefix,
            DJ: rol.id,
          });
          client.sendTime(
            interaction,
            `El rol de DJ de este servidor se ha cambiado exitosamente a ${rol.name}`
          );
        } else {
          /**
           * @type {require("discord.js").Role}
           */
          let rol = interaction.guild.roles.cache.get(GuildDB.DJ);
          client.sendTime(
            interaction,
            `El rol de DJ de este servidor es ${rol.name}`
          );
        }
      }
    },
  },
};
