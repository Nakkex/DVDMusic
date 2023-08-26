const { MessageEmbed } = require("discord.js");
const _ = require("lodash");
const prettyMilliseconds = require("pretty-ms");
let d;

module.exports = {
  name: "cola",
  description: "Muestra todas las canciones actualmente encoladas",
  usage: "",
  permissions: {
    channel: ["VER_CANAL", "ENVIAR_MENSAJES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["q"],
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

    if (!player.queue || !player.queue.length || player.queue === 0) {
      let QueueEmbed = new MessageEmbed()
        .setAuthor("Reproduciendo actualmente", client.botconfig.IconURL)
        .setColor(client.botconfig.EmbedColor)
        .setDescription(
          `[${player.queue.current.title}](${player.queue.current.uri})`
        )
        .addField("Solicitado por", `${player.queue.current.requester}`, true)
        .setThumbnail(player.queue.current.displayThumbnail());

      // Comprobar si la duración coincide con la duración de una transmisión en vivo
      if (player.queue.current.duration == 9223372036854776000) {
        QueueEmbed.addField("Duración", `\`En vivo\``, true);
      } else {
        QueueEmbed.addField(
          "Duración",
          `${
            client.ProgressBar(
              player.position,
              player.queue.current.duration,
              15
            ).Bar
          } \`[${prettyMilliseconds(player.position, {
            colonNotation: true,
          })} / ${prettyMilliseconds(player.queue.current.duration, {
            colonNotation: true,
          })}]\``
        );
      }

      return message.channel.send(QueueEmbed);
    }

    let Canciones = player.queue.map((t, index) => {
      t.index = index;
      return t;
    });

    let CancionesPorPagina = _.chunk(Canciones, 10); // Cuántas canciones mostrar por página

    let Páginas = CancionesPorPagina.map((Pistas) => {
      let DescripciónCanciones = Pistas.map((t) => {
        let d;
        // Comprobar si la duración coincide con la duración de una transmisión en vivo
        if (t.duration == 9223372036854776000) {
          d = "En vivo";
        } else {
          d = prettyMilliseconds(t.duration, { colonNotation: true });
        }
        return `\`${t.index + 1}.\` [${t.title}](${
          t.uri
        }) \n\`${d}\` **|** Solicitado por: ${t.requester}\n`;
      }).join("\n");

      let Embed = new MessageEmbed()
        .setAuthor("Cola", client.botconfig.IconURL)
        .setColor(client.botconfig.EmbedColor)
        .setDescription(
          `**Reproduciendo actualmente:** \n[${player.queue.current.title}](${player.queue.current.uri}) \n\n**A continuación:** \n${DescripciónCanciones}\n\n`
        )
        .addField("Total de canciones: \n", `\`${player.queue.totalSize - 1}\``, true);

      // Comprobar si la duración coincide con la duración de una transmisión en vivo
      if (player.queue.duration >= 9223372036854776000) {
        d = "En vivo";
      } else {
        d = prettyMilliseconds(player.queue.duration, { colonNotation: true });
      }

      Embed.addField("Duración total: \n", `\`${d}\``, true).addField(
        "Solicitado por:",
        `${player.queue.current.requester}`,
        true
      );

      if (player.queue.current.duration == 9223372036854776000) {
        Embed.addField("Duración de la canción actual:", "`En vivo`");
      } else {
        Embed.addField(
          "Duración de la canción actual:",
          `${
            client.ProgressBar(
              player.position,
              player.queue.current.duration,
              15
            ).Bar
          } \`${prettyMilliseconds(player.position, {
            colonNotation: true,
          })} / ${prettyMilliseconds(player.queue.current.duration, {
            colonNotation: true,
          })}\``
        );
      }

      Embed.setThumbnail(player.queue.current.displayThumbnail());

      return Embed;
    });

    if (!Páginas.length || Páginas.length === 1)
      return message.channel.send(Páginas[0]);
    else client.Pagination(message, Páginas);
  },
  SlashCommand: {
    /*
    options: [
      {
          name: "page",
          value: "[page]",
          type: 4,
          required: false,
          description: "Enter the page of the queue you would like to view",
      },
  ],
  */
    /**
     *
     * @param {import("../structures/DiscordMusicBot")} client
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     * @param {*} param3
     */
    run: async (client, interaction, args, { GuildDB }) => {
      let player = await client.Manager.get(interaction.guild_id);
      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nada se está reproduciendo en este momento...**"
        );

      if (!player.queue || !player.queue.length || player.queue === 0) {
        let QueueEmbed = new MessageEmbed()
          .setAuthor("Reproduciendo actualmente", client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(
            `[${player.queue.current.title}](${player.queue.current.uri})`
          )
          .addField("Solicitado por", `${player.queue.current.requester}`, true)
          .setThumbnail(player.queue.current.displayThumbnail());
        if (player.queue.current.duration == 9223372036854776000) {
          QueueEmbed.addField("Duración", `\`En vivo\``, true);
        } else {
          QueueEmbed.addField(
            "Duración",
            `${
              client.ProgressBar(
                player.position,
                player.queue.current.duration,
                15
              ).Bar
            } \`[${prettyMilliseconds(player.position, {
              colonNotation: true,
            })} / ${prettyMilliseconds(player.queue.current.duration, {
              colonNotation: true,
            })}]\``
          );
        }
        return interaction.send(QueueEmbed);
      }

      let Canciones = player.queue.map((t, index) => {
        t.index = index;
        return t;
      });

      let CancionesPorPagina = _.chunk(Canciones, 10); // Cuántas canciones mostrar por página

      let Páginas = CancionesPorPagina.map((Pistas) => {
        let DescripciónCanciones = Pistas.map((t) => {
          let d;
          // Comprobar si la duración coincide con la duración de una transmisión en vivo
          if (t.duration == 9223372036854776000) {
            d = "En vivo";
          } else {
            d = prettyMilliseconds(t.duration, { colonNotation: true });
          }
          return `\`${t.index + 1}.\` [${t.title}](${
            t.uri
          }) \n\`${d}\` **|** Solicitado por: ${t.requester}\n`;
        }).join("\n");

        let Embed = new MessageEmbed()
          .setAuthor("Cola", client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(
            `**Reproduciendo actualmente:** \n[${player.queue.current.title}](${player.queue.current.uri}) \n\n**A continuación:** \n${DescripciónCanciones}\n\n`
          )
          .addField("Total de canciones: \n", `\`${player.queue.totalSize - 1}\``, true);

        // Comprobar si la duración coincide con la duración de una transmisión en vivo
        if (player.queue.duration >= 9223372036854776000) {
          d = "En vivo";
        } else {
          d = prettyMilliseconds(player.queue.duration, { colonNotation: true });
        }

        Embed.addField("Duración total: \n", `\`${d}\``, true).addField(
          "Solicitado por:",
          `${player.queue.current.requester}`,
          true
        );

        if (player.queue.current.duration == 9223372036854776000) {
          Embed.addField("Duración de la canción actual:", "`En vivo`");
        } else {
          Embed.addField(
            "Duración de la canción actual:",
            `${
              client.ProgressBar(
                player.position,
                player.queue.current.duration,
                15
              ).Bar
            } \`${prettyMilliseconds(player.position, {
              colonNotation: true,
            })} / ${prettyMilliseconds(player.queue.current.duration, {
              colonNotation: true,
            })}\``
          );
        }

        Embed.setThumbnail(player.queue.current.displayThumbnail());

        return Embed;
      });

      if (!Páginas.length || Páginas.length === 1)
        return interaction.send(Páginas[0]);
      else client.Pagination(interaction, Páginas);
    },
  },
};

