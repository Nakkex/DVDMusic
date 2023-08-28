module.exports = {
  Admins: ["UserID", "UserID"], //DEV'S
  ExpressServer: true, 
  DefaultPrefix: process.env.Prefix || ">",
  Port: 80, //Which port website gonna be hosted
  SupportServer: "https://discord.io/sciencegear", // Support Server Link
  Token: process.env.Token || "MTE0NTU4MjQ3ODc3NDUwNTQ3Mw.G6kto9.1H9tkc1-cylsH8Np6TpmaOiwVZkPGXWniLYg7Y", // Discord Bot Token
  ClientID: process.env.Discord_ClientID || "", 
  ClientSecret: process.env.Discord_ClientSecret || "X12g9l9d5TuTbQVJ6Db4yJ6UBh-CQ_Hp", 
  Scopes: ["identify", "guilds", "applications.commands"],
  ServerDeafen: true, 
  DefaultVolume: 100,
  CallbackURL: "/api/callback", 
  "24/7": false,
  CookieSecret: "Coscu es GOD",
  IconURL:
    "https://media.tenor.com/sce9SDRey4EAAAAi/disc.gif",
  EmbedColor: "RANDOM", 
  Permissions: 2205281600, 
  Website: process.env.Website || "http://127.0.0.1/",

  Presence: {
    status: "online", // You can show online, idle, and dnd
    name: "Music", // The message shown
    type: "LISTENING", // PLAYING, WATCHING, LISTENING, STREAMING
  },

  Lavalink: {
    id: "Main",
    host: "ssl.horizxon.studio", 
    port: 443, 
    pass: "horizxon.studio", 
    secure: true, 
    retryAmount: 200, 
    retryDelay: 40, 
  },
  
  Spotify: {
    ClientID: process.env.Spotify_ClientID || "", 
    ClientSecret: process.env.Spotify_ClientSecret || "", 
  },


 

};
