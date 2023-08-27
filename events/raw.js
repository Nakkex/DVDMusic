module.exports = (client, data) => {
  // ¿Qué es 'data'? Datos de la Puerta de Enlace de Discord. Por favor, consulta la documentación de la API de Discord.
  // El parámetro 'data' contiene información sobre el evento de cambio de estado de voz en Discord.

  // Actualiza el estado de voz en el cliente de música
  client.Manager.updateVoiceState(data);
};
