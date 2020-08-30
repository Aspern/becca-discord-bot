import Settings from "./settings/settings";
import Logger from './logger'
import Help from './help'
import Discord, {Message, VoiceChannel, VoiceConnection} from 'discord.js'
import MessageProcessor from "./massage/message-processor";
import Code from "./code";
import {Alliance} from "./alliance";
import aws from 'aws-sdk';
import * as fs from 'fs'
import {RallyOptions} from "./rally/rally-options";
import RallyHelper from "./rally/rally-helper";

const logger = Logger.createLogger()

export default class Becca {
    static VOICE_ID = 'Vicki'

    private readonly client
    private readonly settings: Settings
    private readonly code: Code
    private readonly alliance: Alliance
    private readonly messageProcessor
    private readonly polly
    private readonly rallyHelper

    constructor(settings: Settings) {
        this.client = new Discord.Client()
        this.messageProcessor = new MessageProcessor()
        this.settings = settings
        this.code = new Code(this.settings)
        this.alliance = new Alliance(this.settings)
        this.polly = new aws.Polly({region: settings.awsRegion})
        this.rallyHelper = new RallyHelper()
    }

    async wakeUp() {

        this.client.on('ready', this.onReady.bind(this))
        this.client.on('message', this.messageProcessor.onMessage.bind(this.messageProcessor))

        this.messageProcessor.on('help', Becca.giveHelp)
        this.messageProcessor.on('code', this.tellLatestCode.bind(this))
        this.messageProcessor.on('alliance', this.tellPlayerData.bind(this))
        this.messageProcessor.on('speak', this.speak.bind(this))
        this.messageProcessor.on('rally', this.coordinateRallies.bind(this))

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

    private async coordinateRallies(message: Message, options: RallyOptions) {
        const countdowns = this.rallyHelper.createRallyCountdowns(options)
        const channel = await this.client.channels.cache.get(this.settings.voiceChannelId)

        if (channel instanceof VoiceChannel && channel.joinable) {
            const connection = await channel.join()

            countdowns.sort((c1, c2) => c2.timeout - c1.timeout)

            setTimeout(async () => {
                connection.disconnect()
            }, countdowns[0].timeout + 20000)

            countdowns.forEach(countdown => {
                setTimeout(async () => {
                    if (countdown.message)
                        await this.say(countdown.message, connection)
                }, countdown.timeout)
            })
        }
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

    private async speak(message: Message, {msg}: { msg: string }) {
        const channel = await this.client.channels.cache.get(this.settings.voiceChannelId)

        if (channel instanceof VoiceChannel && channel.joinable) {
            const connection = await channel.join()
            try {
                await this.say(`<speak>${msg}</speak>`, connection)
            } catch (error) {
                connection.disconnect()
            }
            connection.disconnect()
        }
    }

    private async say(message: string, connection: VoiceConnection) {
        return new Promise<void>(((resolve, reject) => {
            this.polly.synthesizeSpeech({
                    OutputFormat: 'mp3',
                    TextType: 'ssml',
                    Text: message,
                    VoiceId: Becca.VOICE_ID
                }, async (error, data) => {
                    if (error) {
                        logger.error(`Becca: "I could not say something like: ${message}.`, error)
                    } else {
                        try {
                            if (data.AudioStream instanceof Buffer)
                                fs.writeFileSync(`${this.settings.workingDir}/speech.mp3`, data.AudioStream)

                            const dispatcher = connection.play(`${this.settings.workingDir}/speech.mp3`)
                            dispatcher.on('speaking', speaking => {
                                if (!speaking) {
                                    resolve()
                                }
                            })

                        } catch (error) {
                            logger.error('Failed to save speech.mp3 in working directory.', error)
                            reject()
                        }
                    }
                }
            )
        }))

    }
}
