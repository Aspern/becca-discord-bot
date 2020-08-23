import Settings from "./settings/settings";
import Logger from './logger'
import Help from './help'
import Discord, {Message} from 'discord.js'
import MessageProcessor from "./massage/message-processor";
import Code from "./code";
import {Alliance} from "./alliance";

const logger = Logger.createLogger()

export default class Becca {

    private readonly client
    private readonly settings: Settings
    private readonly code: Code
    private readonly alliance: Alliance
    private readonly messageProcessor

    constructor(settings: Settings) {
        this.client = new Discord.Client()
        this.messageProcessor = new MessageProcessor()
        this.settings = settings
        this.code = new Code(this.settings)
        this.alliance = new Alliance(this.settings)
    }

    async wakeUp() {

        this.client.on('ready', this.onReady.bind(this))
        this.client.on('message', this.messageProcessor.onMessage.bind(this.messageProcessor))

        this.messageProcessor.on('help', Becca.giveHelp)
        this.messageProcessor.on('code', this.tellLatestCode.bind(this))
        this.messageProcessor.on('alliance', this.tellPlayerData.bind(this))

        try {
            logger.info('Waking up Becca...')
            await this.client.login(this.settings.botToken)
            logger.info("Becca: 'Hey I'm awake what can I do for you?'")
        } catch (error) {
            logger.error('Could not wake up becca:', error)
        }
    }

    private async onReady() {
        this.createSearchCodeTask()
    }

    private static async giveHelp(message: Message) {
        const author = message.author.username
        const reply = `Hey ${author}, schau mal was ich alles kann:\n ${Help.print()}`

        await message.channel.send(reply)
    }

    private async tellLatestCode(message: Message) {
        const author = message.author.username
        const data = this.code.getLatestCode()
        let reply: string

        if (!data) {
            reply = `Hey ${author} ich habe leider noch keinen Code gefunden :anguished:.`
        } else {
            reply = `Hey ${author}, der aktuelle Code lautet **${data?.code}** und ist vom ${new Date(data?.timestamp).toLocaleString()}.`
        }

        await message.channel.send(reply)
    }

    private async tellPlayerData(message: Message, {sorter}: { sorter: string }) {
        const author = message.author.username
        let reply: string

        try {
            reply = await this.alliance.playerData(sorter)
        } catch (error) {
            reply = `Hallo ${author}, leider pflegt deine Allianz keiner Spielerdaten :thinking:.`
        }

        await message.channel.send(reply)
    }

    private createSearchCodeTask() {
        const self = this
        this.code.onCodeFound(async data => {
            const channel = self.client.channels.cache.get(this.settings.textChannelId)
            if (!!data.code) {
                // @ts-ignore
                await channel?.send(`Hey, ich habe einen neuen Code gefunden um ein Paket einzulösen! Er lautet **${data.code}**.`)
            }
        })

        return setInterval(async () => {
            logger.info('Becca: "Let\'s search for some new codes..."')
            await this.code.searchCode()
        }, (1000 * 60 * 10)) // 10 minutes
    }
}
