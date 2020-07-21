const Discord = require('discord.js')
const client = new Discord.Client()
const getLatestPromoCode = require('./promo-codes')
const token = process.env.DISCORD_BOT_TOKEN


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", msg => {
  if (msg.content === "promo?") {
    getLatestPromoCode().then(code => {
      msg.reply(`der neueste Promo Code lautet **${code}**.`)
    })
  }
})

client.login(token)
