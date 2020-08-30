import {RallyOptionParser} from "../rally/rally-option-parser";

export default class MessageArgumentProcessor {
    private processors = {
        alliance: (args: string): any => {
            const options: any = {}
            if (args) {
                let sorter = args.split('sorter=')[1]

                if (sorter) {
                    options.sorter = sorter.trim()
                }
            }

            return options
        },

        speak: (args: string): any => {
            return {
                msg: args
            }
        },

        rally: (args: string): any => {
            const parser = new RallyOptionParser()

            return parser.parse(args)
        }
    }

    process(command: string, args: string): any {
        let result = {}

        if (this.processors.hasOwnProperty(command)) {
            // @ts-ignore
            result = this.processors[command](args)
        }

        return result
    }

}
