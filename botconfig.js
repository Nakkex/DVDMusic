module.exports = {
  Admins: ["UserID", "UserID"], //DEV'S
  ExpressServer: true, 
  DefaultPrefix: process.env.Prefix || ">",
  Port: 80, //Which port website gonna be hosted
  SupportServer: "https://discord.io/sciencegear", // Support Server Link
  Token: process.env.Token || "MTE0NTU4MjQ3ODc3NDUwNTQ3Mw.GcCSrl.bwQ8KDLPoEU7LWrHtLXekixsxhFmvzQqmz4RAs
", // Discord Bot Token
  ClientID: process.env.Discord_ClientID || "1145582478774505473", 
  ClientSecret: process.env.Discord_ClientSecret || "DMAcfnE6XLgL5GJC92X2ovlaxgja9D99", 
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
    ClientID: process.env.Spotify_ClientID || "cf29400665ce457bbb4a39ac818893d6", 
    ClientSecret: process.env.Spotify_ClientSecret || "d085587513aa43faa3ebfbdfac1a273a", 
  },


 

};
