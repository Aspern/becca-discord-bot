import MessageArgumentProcessor from "./message-argument-processor";
import {Message} from "discord.js";

export default class MessageProcessor {
    private argumentProcessor
    private handlers
    private regex

    constructor() {
        this.argumentProcessor = new MessageArgumentProcessor()
        this.handlers = new Map<string, Function>()
        this.regex = /^becca:(\w+)(.*)$/i
    }

    onMessage(message: Message) {
        const match = this.regex.exec(message.content)

        if (match) {
            const command = match[1]
            const args = match[2]

            this.invokeHandler(message, command, args)
        }
    }

    on(command: string, cb: (message: Message, args?: any) => void) {
        this.handlers.set(command, cb)
    }

    private invokeHandler(message: Message, command: string, args: string) {
        if (this.handlers.has(command)) {
            const handler = this.handlers.get(command)

            if (handler) {
                handler(message, this.argumentProcessor.process(command, args))
            }
        }
    }
}
