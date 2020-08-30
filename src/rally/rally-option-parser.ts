import {RallyOptions} from "./rally-options";
import moment from "moment";

class RallyOptionParser {

    parse(input: string): RallyOptions {
        const regex = /in (\d+) seconds \[(.*)]/gi
        const match = regex.exec(input)
        const options: RallyOptions = {rallies: []}

        if (match && match.length >= 3) {
            options.in = moment.duration(match[1], 'seconds')
            const rawRallies = match[2]
                .split(',')
            let order = 0

            rawRallies.forEach(rawRally => {
                const data = rawRally.split('#')
                const player = data[0]
                const rallyTimer = moment.duration({
                    minutes: parseInt(data[1].split(':')[0]),
                    seconds: parseInt(data[1].split(':')[1])
                })
                const marchDuration = moment.duration({
                    minutes: parseInt(data[2].split(':')[0]),
                    seconds: parseInt(data[2].split(':')[1])
                })

                options.rallies.push({
                    player,
                    order: order++,
                    rallyTimer,
                    marchDuration
                })
            })
        }

        return options
    }

}

export {RallyOptionParser}
