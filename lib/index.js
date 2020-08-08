const Discord = require('discord.js')
const client = new Discord.Client()
const promoCode = require('./promo-codes')
const alliancePower = require('./alliance-power')
const token = process.argv[2]
const battlePowerRegex = /\? playerData ?([0-9]*) ?([a-zA-Z]*)/i

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`)
  promoCode.onNewPromoCode(promoCode => {
    client.channels.cache.get('730860369752490019')
      .send(`Hey, ich habe einen neuen Code gefunden um ein Paket einzulösen! Er lautet **${promoCode}**.`)
  })
  await alliancePower.updateData()
})

client.on("message", async (msg) => {
  if (msg.content === "? promo") {
    try {
      const promoCode = await promoCode.getLatestPromoCode()
      await msg.reply(`der neueste Code lautet **${promoCode}**.`)
    } catch (e) {
      await msg.reply(`ich habe leider keinen Code für dich gefunden :anguished:.`)
    }
  }

  if (msg.content === '? help') {

  }

  if (msg.content.match(battlePowerRegex)) {
    let size = battlePowerRegex.exec(msg.content)[1]
    let sorter = battlePowerRegex.exec(msg.content)[2]

    size = !!size ? size : undefined
    sorter = !!sorter ? size : undefined

    await msg.reply(`\n${alliancePower.listAllPlayerData(size, sorter)}`)
  }
})

client.login(token)
  .then()
  .catch(console.error)
