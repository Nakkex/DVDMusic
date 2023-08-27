const { MessageEmbed } = require("discord.js");
const _ = require("lodash");
const prettyMilliseconds = require("pretty-ms");
let d;

module.exports = {
  name: "queue",
  description: "Muestra todas las canciones encoladas actualmente",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
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
        "❌ | **No se está reproduciendo nada en este momento...**"
      );

    if (!player.queue || !player.queue.length || player.queue === 0) {
      let EmbedCola = new MessageEmbed()
        .setAuthor("Reproduciendo actualmente", client.botconfig.IconURL)
        .setColor(client.botconfig.EmbedColor)
        .setDescription(
          `[${player.queue.current.title}](${player.queue.current.uri})`
        )
        .addField("Pedido por", `${player.queue.current.requester}`, true)
        .setThumbnail(player.queue.current.displayThumbnail());

      // Comprueba si la duración coincide con la duración de una transmisión en vivo
      if (player.queue.current.duration == 9223372036854776000) {
        EmbedCola.addField("Duración", `\`En Vivo\``, true);
      } else {
        EmbedCola.addField(
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

      return message.channel.send(EmbedCola);
    }

    let Canciones = player.queue.map((t, index) => {
      t.index = index;
      return t;
    });

    let CancionesPorBloque = _.chunk(Canciones, 10); // Cantidad de canciones a mostrar por página

    let Páginas = CancionesPorBloque.map((Tracks) => {
      let DescripciónCanciones = Tracks.map((t) => {
        let d;
        // Comprueba si la duración coincide con la duración de una transmisión en vivo
        if (t.duration == 9223372036854776000) {
          d = "En Vivo";
        } else {
          d = prettyMilliseconds(t.duration, { colonNotation: true });
        }
        return `\`${t.index + 1}.\` [${t.title}](${
          t.uri
        }) \n\`${d}\` **|** Pedido por: ${t.requester}\n`;
      }).join("\n");

      let EmbedCola = new MessageEmbed()
        .setAuthor("Cola de Reproducción", client.botconfig.IconURL)
        .setColor(client.botconfig.EmbedColor)
        .setDescription(
          `**Reproduciendo Actualmente:** \n[${player.queue.current.title}](${player.queue.current.uri}) \n\n**Próximas:** \n${DescripciónCanciones}\n\n`
        )
        .addField("Total de canciones: \n", `\`${player.queue.totalSize - 1}\``, true);

      // Comprueba si la duración coincide con la duración de una transmisión en vivo
      if (player.queue.duration >= 9223372036854776000) {
        d = "En Vivo";
      } else {
        d = prettyMilliseconds(player.queue.duration, { colonNotation: true });
      }

      EmbedCola.addField("Duración Total: \n", `\`${d}\``, true).addField(
        "Pedido por:",
        `${player.queue.current.requester}`,
        true
      );

      if (player.queue.current.duration == 9223372036854776000) {
        EmbedCola.addField("Duración de la canción actual:", "`En Vivo`");
      } else {
        EmbedCola.addField(
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

      EmbedCola.setThumbnail(player.queue.current.displayThumbnail());

      return EmbedCola;
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
          "❌ | **No se está reproduciendo nada en este momento...**"
        );

      if (!player.queue || !player.queue.length || player.queue === 0) {
        let EmbedCola = new MessageEmbed()
          .setAuthor("Reproduciendo actualmente", client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(
            `[${player.queue.current.title}](${player.queue.current.uri})`
          )
          .addField("Pedido por", `${player.queue.current.requester}`, true)
          .setThumbnail(player.queue.current.displayThumbnail());
        if (player.queue.current.duration == 9223372036854776000) {
          EmbedCola.addField("Duración", `\`En Vivo\``, true);
        } else {
          EmbedCola.addField(
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
        return interaction.send(EmbedCola);
      }

      let Canciones = player.queue.map((t, index) => {
        t.index = index;
        return t;
      });

      let CancionesPorBloque = _.chunk(Canciones, 10); // Cantidad de canciones a mostrar por página

      let Páginas = CancionesPorBloque.map((Tracks) => {
        let DescripciónCanciones = Tracks.map((t) => {
          let d;
          // Comprueba si la duración coincide con la duración de una transmisión en vivo
          if (t.duration == 9223372036854776000) {
            d = "En Vivo";
          } else {
            d = prettyMilliseconds(t.duration, { colonNotation: true });
          }
          return `\`${t.index + 1}.\` [${t.title}](${
            t.uri
          }) \n\`${d}\` **|** Pedido por: ${t.requester}\n`;
        }).join("\n");

        let EmbedCola = new MessageEmbed()
          .setAuthor("Cola de Reproducción", client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(
            `**Reproduciendo Actualmente:** \n[${player.queue.current.title}](${player.queue.current.uri}) \n\n**Próximas:** \n${DescripciónCanciones}\n\n`
          )
          .addField(
            "Total de canciones: \n",
            `\`${player.queue.totalSize - 1}\``,
            true
          );

        // Comprueba si la duración coincide con la duración de una transmisión en vivo
        if (player.queue.duration >= 9223372036854776000) {
          d = "En Vivo";
        } else {
          d = prettyMilliseconds(player.queue.duration, {
            colonNotation: true,
          });
        }

        EmbedCola.addField("Duración Total: \n", `\`${d}\``, true).addField(
          "Pedido por:",
          `${player.queue.current.requester}`,
          true
        );

        if (player.queue.current.duration == 9223372036854776000) {
          EmbedCola.addField("Duración de la canción actual:", "`En Vivo`");
        } else {
          EmbedCola.addField(
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

        EmbedCola.setThumbnail(player.queue.current.displayThumbnail());

        return EmbedCola;
      });

      if (!Páginas.length || Páginas.length === 1)
        return interaction.send(Páginas[0]);
      else client.Pagination(interaction, Páginas);
    },
  },
};
