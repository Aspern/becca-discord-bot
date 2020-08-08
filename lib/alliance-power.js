const spreedSheetId = process.argv[3]
const gid = process.argv[4]
const axios = require('axios')
const csv = require('csvtojson')
const AsciiTable = require('ascii-table')

module.exports = {
  _interval: null,
  _data: null,

  listAllPlayerData(size = 10, sorter = 'Kampfkraft') {
    const playerData = this._data.slice()
    const table = new AsciiTable()

    playerData.sort((player1, player2) => {
      return parseFloat(player2[sorter] || 0) - parseFloat(player1[sorter] || 0)
    })

    const result = !!size ? playerData.slice(0, size) : playerData

    table.setHeading('Rang', 'Spieler', 'Kampfkraft', 'Rallykapazität', 'Marschkapazität')

    result.forEach(record => {
      table.addRow(record.Rang, record.Spieler, record.Kampfkraft, record.Rallykapazität, record.Marschkapazität)
    })

    return `\`\`\`\n${table.toString()}\n\`\`\``
  },

  async updateData() {
    if (!this._data)
      this._data = await this._fetchData()

    this._interval = setInterval(async () => {
      this._data = await this._fetchData()
    }, 1000 * 60 * 10)
  },

  async _fetchData() {
    return new Promise(async (resolve, reject) => {

      try {
        const response = await axios
          .get(`https://docs.google.com/spreadsheets/d/e/${spreedSheetId}/pub?gid=${gid}&single=true&output=csv`)
        const json = await csv(response.data)
          .fromString(response.data)

        resolve(json)
      } catch (error) {
        reject(error)
      }
    })

  }

}
