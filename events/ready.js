module.exports = async (client) => {
  // Establece la propiedad 'Ready' en true en el cliente
  client.Ready = true;

  // Configura la presencia del bot en Discord
  client.user.setPresence({
    status: client.botconfig.Presence.status, // Estado del bot: online, idle, dnd (no molestar)
    activity: {
      name: client.botconfig.Presence.name, // Nombre de la actividad (por ejemplo, "Listening to Music")
      type: client.botconfig.Presence.type, // Tipo de actividad: PLAYING, LISTENING, WATCHING, STREAMING
    },
  });

  // Inicializa el cliente de música (Manager) utilizando el ID del bot
  client.Manager.init(client.user.id);

  // Registra comandos de barra en Discord
  client.RegisterSlashCommands();

  // Muestra un mensaje en la consola indicando que el bot ha iniciado sesión exitosamente
  client.log("Successfully Logged in as " + client.user.tag);
};
