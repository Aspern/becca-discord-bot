const https = require('https')
const jsdom = require('jsdom')

module.exports = async function getLatestPromoCode() {
  return new Promise(resolve => {
    let promoCode = 'Ich habe leider gerade keinen Promo Code für dich :('

    https.get('https://www.mejoress.com/en/state-of-survival-code-redeem-codes/', response => {
      let data = ''

      response.on('data', chunk => {
        data += chunk
      })

      response.on('end', () => {
        const root = new jsdom.JSDOM(data)
        const document = root.window.document
        const liElements = document.getElementsByTagName('li')

        for (let i = 0; i < liElements.length; i++) {
          const li = liElements[i]
          const text = li.textContent

          if (text.endsWith(': Redeem this code before expires')) {
            promoCode = text.replace(': Redeem this code before expires', '')
            break;
          }
        }

        resolve(promoCode)
      })
    })
  })
}
