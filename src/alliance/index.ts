import Settings from "../settings/settings";
import axios from 'axios'
import Logger from '../logger'
import PlayerData from "./player-data";

const AsciiTable = require('ascii-table')
const logger = Logger.createLogger()
const csv = require('csvtojson')

export class Alliance {
    static PLAYER_DATA_MAX_SIZE = 10

    private readonly settings: Settings
    private readonly fields = [
        {
            name: 'Rang',
            sorter: (a: PlayerData, b: PlayerData) => b.Rang.localeCompare(a.Rang)
        },
        {
            name: 'Spieler',
            sorter: (a: PlayerData, b: PlayerData) => a.Spieler.localeCompare(b.Spieler)
        },
        {
            name: 'Kampfkraft',
            sorter: (a: PlayerData, b: PlayerData) => b.Kampfkraft - a.Kampfkraft,
            default: true
        },
        {
            name: 'Rallykapazität',
            sorter: (a: PlayerData, b: PlayerData) => b.Rallykapazität - a.Rallykapazität
        },
        {
            name: 'Marschkapazität',
            sorter: (a: PlayerData, b: PlayerData) => b.Marschkapazität - a.Marschkapazität
        }
    ]

    constructor(settings: Settings) {
        this.settings = settings
    }

    async playerData(sorter = 'Kampfkraft') {
        if (!this.settings.playerDataSource)
            throw new Error('No data source for player data is configured.')

        const playerData = await this.fetchPlayerData()
        const table = new AsciiTable()

        playerData.sort(this.getSorterOrDefault(sorter))

        const slicedPlayerData = playerData.slice(0, Alliance.PLAYER_DATA_MAX_SIZE)

        table.setHeading(this.fields.map(field => field.name))

        slicedPlayerData.forEach(record => {
            table.addRow(record.Rang, record.Spieler, record.Kampfkraft, record.Rallykapazität, record.Marschkapazität)
        })

        return `\`\`\`\n${table.toString()}\n\`\`\``
    }

    private async fetchPlayerData(): Promise<PlayerData[]> {
        let playerData: PlayerData[] = []
        try {
            logger.info("Loading current player data from source...")

            if (this.settings.playerDataSource != null) {
                const response = await axios.get(this.settings.playerDataSource)
                playerData = await csv(response.data)
                    .fromString(response.data)
            }
        } catch (error) {
            logger.error('Failed loading current player data.', error)
        }

        return playerData
    }

    private getSorterOrDefault(sorter: string): (a: PlayerData, b: PlayerData) => number {
        let result = this.fields.filter(field => field.name === sorter)

        if (result.length > 0) return result[0].sorter
        return this.fields.filter(field => field.default === true)[0].sorter
    }
}
