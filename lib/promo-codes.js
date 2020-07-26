const https = require('https')
const jsdom = require('jsdom')
const fs = require('fs')

module.exports = {
  _interval: null,

  async getLatestPromoCode() {
    return new Promise((resolve, reject) => {
      let promoCode = ''

      console.log('searching for latest promo code...')
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

          console.log(`latest promo code is: ${promoCode}.`)
          resolve(promoCode)
        })
      })
        .on('error', reject)
    })
  },

  onNewPromoCode(callback) {
    console.log('started interval for searching promo codes.')

    this._initCache()

    this._interval = setInterval(async () => {
      try {
        const currentPromoCode = await this._readLatestPromoCodeFromCache()
        const nextPromoCode = await this.getLatestPromoCode()

        if (currentPromoCode !== nextPromoCode) {
          await this._writeLatestPromoCodeToCache(nextPromoCode)
          callback(nextPromoCode)
        }

      } catch (e) {
        console.error(e)
      }
    }, (1000 * 20 * 15))
  },

  async _readLatestPromoCodeFromCache() {
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync('/tmp/becca/promo-cache.txt')) {
          resolve(null)
        } else {
          resolve(fs.readFileSync('/tmp/becca/promo-cache.txt').toString())
        }
      } catch (e) {
        reject(e)
      }
    })
  },

  async _writeLatestPromoCodeToCache(promoCode) {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync('/tmp/becca/promo-cache.txt', promoCode)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  },

  _initCache() {
    try {
      if (!fs.existsSync('/tmp')) {
        fs.mkdirSync('/tmp')
        fs.mkdirSync('/tmp/becca')
      } else if (!fs.existsSync('/tmp/becca')) {
        fs.mkdirSync('/tmp/becca')
      }
    } catch (e) {
      console.error(e)
    }
  }
}
