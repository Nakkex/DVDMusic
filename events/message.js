/**
 *
 * @param {require("../structures/DiscordMusicBot")} client
 * @param {require("discord.js").Message} message
 * @returns {void} aka: nada ;-;
 */

module.exports = async (client, message) => {
  if (message.author.bot || message.channel.type === "dm") return;
  let prefix = client.botconfig.DefaultPrefix;

  let GuildDB = await client.GetGuild(message.guild.id);
  if (GuildDB && GuildDB.prefix) prefix = GuildDB.prefix;

  // Inicializar GuildDB
  if (!GuildDB) {
    await client.database.guild.set(message.guild.id, {
      prefix: prefix,
      DJ: null,
    });
    GuildDB = await client.GetGuild(message.guild.id);
  }

  // Los prefijos también pueden coincidir con menciones
  const mencionDelPrefijo = new RegExp(`^<@!?${client.user.id}> `);
  prefix = message.content.match(mencionDelPrefijo)
    ? message.content.match(mencionDelPrefijo)[0]
    : prefix;

  if (message.content.indexOf(prefix) !== 0) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  // Convertir el comando a minúsculas ya que el nombre de los archivos estará en minúsculas
  const comando = args.shift().toLowerCase();

  // Buscar un comando
  const cmd =
    client.commands.get(comando) ||
    client.commands.find((x) => x.aliases && x.aliases.includes(comando));

  // Ejecutar el código cuando se recibe el comando o sus alias
  if (cmd) {
    if (
      (cmd.permissions &&
        cmd.permissions.channel &&
        !message.channel
          .permissionsFor(client.user)
          .has(cmd.permissions.channel)) ||
      (cmd.permissions &&
        cmd.permissions.member &&
        !message.channel
          .permissionsFor(message.member)
          .has(cmd.permissions.member)) ||
      (cmd.permissions &&
        GuildDB.DJ &&
        !message.channel
          .permissionsFor(message.member)
          .has(["ADMINISTRATOR"]) &&
        !message.member.roles.cache.has(GuildDB.DJ))
    )
      return client.sendError(
        message.channel,
        "Permisos faltantes!" + GuildDB.DJ
          ? " Necesitas el rol `DJ` para acceder a este comando."
          : ""
      );
    cmd.run(client, message, args, { GuildDB });
    client.CommandsRan++;
  } else return;
};
