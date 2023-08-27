const { DiscordMusicBot } = require("../structures/DiscordMusicBot");
const { VoiceState, MessageEmbed } = require("discord.js");

/**
 *
 * @param {DiscordMusicBot} client - Instancia del bot personalizada
 * @param {VoiceState} oldState - Estado de voz anterior
 * @param {VoiceState} newState - Estado de voz nuevo
 * @returns {Promise<void>}
 */
module.exports = async (client, oldState, newState) => {
  // Obtener el ID del servidor (guild) y el reproductor (player)
  const guildId = newState.guild.id;
  const player = client.Manager.get(guildId);

  // Comprobar si el bot está activo (reproduciendo, en pausa o vacío)
  if (!player || player.state !== "CONNECTED") return;

  // Preparar los datos del cambio de estado
  const stateChange = {};

  // Obtener el tipo de cambio de estado
  if (oldState.channel === null && newState.channel !== null)
    stateChange.type = "JOIN";
  if (oldState.channel !== null && newState.channel === null)
    stateChange.type = "LEAVE";
  if (oldState.channel !== null && newState.channel !== null)
    stateChange.type = "MOVE";
  if (oldState.channel === null && newState.channel === null) return;
  if (newState.serverMute == true && oldState.serverMute == false)
    return player.pause(true);
  if (newState.serverMute == false && oldState.serverMute == true)
    return player.pause(false);

  // Comprobar primero el cambio de MOVE ya que cambia el tipo
  if (stateChange.type === "MOVE") {
    if (oldState.channel.id === player.voiceChannel) stateChange.type = "LEAVE";
    if (newState.channel.id === player.voiceChannel) stateChange.type = "JOIN";
  }

  // Asignar el canal correspondiente al tipo de cambio
  if (stateChange.type === "JOIN") stateChange.channel = newState.channel;
  if (stateChange.type === "LEAVE") stateChange.channel = oldState.channel;

  // Comprobar si el canal de voz del bot está involucrado (salir si no está involucrado)
  if (!stateChange.channel || stateChange.channel.id !== player.voiceChannel)
    return;

  // Filtrar los miembros actuales en función de si son bots o no
  stateChange.members = stateChange.channel.members.filter(
    (member) => !member.user.bot
  );

  switch (stateChange.type) {
    case "JOIN":
      if (stateChange.members.size === 1 && player.paused) {
        // Reanudar la reproducción si había un solo miembro en el canal y estaba en pausa
        let emb = new MessageEmbed()
          .setAuthor(`Resuming paused queue`, client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(
            `Resuming playback because all of you left me with music to play all alone`
          );
        await client.channels.cache.get(player.textChannel).send(emb);

        // Actualizar el mensaje "now playing" y llevarlo al frente
        let msg2 = await client.channels.cache
          .get(player.textChannel)
          .send(player.nowPlayingMessage.embeds[0]);
        player.setNowplayingMessage(msg2);

        player.pause(false);
      }
      break;
    case "LEAVE":
      if (stateChange.members.size === 0 && !player.paused && player.playing) {
        // Pausar la reproducción si todos los miembros abandonan el canal
        player.pause(true);

        let emb = new MessageEmbed()
          .setAuthor(`Paused!`, client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(`The player has been paused because everybody left`);
        await client.channels.cache.get(player.textChannel).send(emb);
      }
      break;
  }
};
