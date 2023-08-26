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
   * @param {import("../structures/DiscordMusicBot")} cliente
   * @param {import("discord.js").Message} mensaje
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (cliente, mensaje, args, { GuildDB }) => {
    let reproductor = await cliente.Manager.get(mensaje.guild.id);
    if (!reproductor)
      return cliente.sendTime(
        mensaje.channel,
        "❌ | **Nada se está reproduciendo en este momento...**"
      );

    if (!reproductor.queue || !reproductor.queue.length || reproductor.queue === 0) {
      let ColaEmbed = new MessageEmbed()
        .setAuthor("Reproduciendo actualmente", cliente.botconfig.IconURL)
        .setColor(cliente.botconfig.EmbedColor)
        .setDescription(
          `[${reproductor.queue.current.title}](${reproductor.queue.current.uri})`
        )
        .addField("Solicitado por", `${reproductor.queue.current.requester}`, true)
        .setThumbnail(reproductor.queue.current.displayThumbnail());

      // Verifica si la duración coincide con la duración de una transmisión en vivo
      if (reproductor.queue.current.duration == 9223372036854776000) {
        ColaEmbed.addField("Duración", `\`En vivo\``, true);
      } else {
        ColaEmbed.addField(
          "Duración",
          `${
            cliente.ProgressBar(
              reproductor.position,
              reproductor.queue.current.duration,
              15
            ).Bar
          } \`[${prettyMilliseconds(reproductor.position, {
            colonNotation: true,
          })} / ${prettyMilliseconds(reproductor.queue.current.duration, {
            colonNotation: true,
          })}]\``
        );
      }

      return mensaje.channel.send(ColaEmbed);
    }

    let Canciones = reproductor.queue.map((t, index) => {
      t.index = index;
      return t;
    });

    let CancionesSeparadas = _.chunk(Canciones, 10); // Cuántas canciones mostrar por página

    let Páginas = CancionesSeparadas.map((Pistas) => {
      let DescripciónCanciones = Pistas.map((t) => {
        let d;
        // Verifica si la duración coincide con la duración de una transmisión en vivo
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
        .setAuthor("Cola", cliente.botconfig.IconURL)
        .setColor(cliente.botconfig.EmbedColor)
        .setDescription(
          `**Reproduciendo actualmente:** \n[${reproductor.queue.current.title}](${reproductor.queue.current.uri}) \n\n**Siguiente:** \n${DescripciónCanciones}\n\n`
        )
        .addField("Total de canciones: \n", `\`${reproductor.queue.totalSize - 1}\``, true);

      // Verifica si la duración coincide con la duración de una transmisión en vivo
      if (reproductor.queue.duration >= 9223372036854776000) {
        d = "En vivo";
      } else {
        d = prettyMilliseconds(reproductor.queue.duration, { colonNotation: true });
      }

      Embed.addField("Duración total: \n", `\`${d}\``, true).addField(
        "Solicitado por:",
        `${reproductor.queue.current.requester}`,
        true
      );

      if (reproductor.queue.current.duration == 9223372036854776000) {
        Embed.addField("Duración de la canción actual:", "`En vivo`");
      } else {
        Embed.addField(
          "Duración de la canción actual:",
          `${
            cliente.ProgressBar(
              reproductor.position,
              reproductor.queue.current.duration,
              15
            ).Bar
          } \`${prettyMilliseconds(reproductor.position, {
            colonNotation: true,
          })} / ${prettyMilliseconds(reproductor.queue.current.duration, {
            colonNotation: true,
          })}\``
        );
      }

      Embed.setThumbnail(reproductor.queue.current.displayThumbnail());

      return Embed;
    });

    if (!Páginas.length || Páginas.length === 1)
      return mensaje.channel.send(Páginas[0]);
    else cliente.Pagination(mensaje, Páginas);
  },
  SlashCommand: {
    /*
    options: [
      {
          name: "page",
          value: "[page]",
          type: 4,
          required: false,
          description: "Ingrese la página de la cola que le gustaría ver",
      },
  ],
  */
    /**
     *
     * @param {import("../structures/DiscordMusicBot")} cliente
     * @param {import("discord.js").Message} mensaje
     * @param {string[]} args
     * @param {*} param3
     */
    run: async (cliente, interacción, args, { GuildDB }) => {
      let reproductor = await cliente.Manager.get(interacción.guild_id);
      if (!reproductor)
        return cliente.sendTime(
          interacción,
          "❌ | **Nada se está reproduciendo en este momento...**"
        );

      if (!reproductor.queue || !reproductor.queue.length || reproductor.queue === 0) {
        let ColaEmbed = new MessageEmbed()
          .setAuthor("Reproduciendo actualmente", cliente.botconfig.IconURL)
          .setColor(cliente.botconfig.EmbedColor)
          .setDescription(
            `[${reproductor.queue.current.title}](${reproductor.queue.current.uri})`
          )
          .addField("Solicitado por", `${reproductor.queue.current.requester}`, true)
          .setThumbnail(reproductor.queue.current.displayThumbnail());
        if (reproductor.queue.current.duration == 9223372036854776000) {
          ColaEmbed.addField("Duración", `\`En vivo\``, true);
        } else {
          ColaEmbed.addField(
            "Duración",
            `${
              cliente.ProgressBar(
                reproductor.position,
                reproductor.queue.current.duration,
                15
              ).Bar
           
