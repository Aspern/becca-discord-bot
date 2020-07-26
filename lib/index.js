const Discord = require('discord.js')
const client = new Discord.Client()
const promoCode = require('./promo-codes')
const token = process.argv[2]

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
  promoCode.onNewPromoCode(promoCode => {
    client.channels.cache.get('730860369752490019').send(`Hey, ich habe einen neuen Code gefunden um ein Paket einzulösen! Er lautet **${promoCode}**.`)
  })
})

client.on("message", async (msg) => {
  if (msg.content === "promo?") {
    try {
      const promoCode = await promoCode.getLatestPromoCode()
      await msg.reply(`der neueste Code lautet **${promoCode}**.`)
    } catch (e) {
      await  msg.reply(`ich habe leider keinen Code für dich gefunden :anguished:.`)
    }
  }
})

client.login(token)
  .then()
  .catch(console.error)
