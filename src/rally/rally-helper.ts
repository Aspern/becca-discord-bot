import {RallyCountdown, RallyOptions} from "./rally-options";

export default class RallyHelper {
    private countDownBreaks = {
        10: '100ms',
        9: '100ms',
        8: '100ms',
        7: '200ms',
        6: '200ms',
        5: '200ms',
        4: '200ms',
        3: '200ms',
        2: '200ms',
        1: '200ms'
    }

    createRallyCountdowns(options: RallyOptions): RallyCountdown[] {
        const countdowns: RallyCountdown[] = []
        const defaultSpeechDuration = (10 * 1000)

        if (options.in) {

            const firstRally = options.rallies.filter(rally => rally.order === 0)[0]
            const firsTallyDuration = firstRally.rallyTimer.asMilliseconds() + firstRally.marchDuration.asMilliseconds()
            const startTimeout = options.in.asMilliseconds()
            const rallyWithDuration = options.rallies.map(rally => {
                return {
                    player: rally.player,
                    order: rally.order,
                    offsetToFirstRally: firsTallyDuration - (rally.marchDuration.asMilliseconds() + rally.rallyTimer.asMilliseconds())
                }
            })

            rallyWithDuration.sort((r1, r2) => r1.offsetToFirstRally - r2.offsetToFirstRally)

            const firstRallyToStart = rallyWithDuration[0]
            let startMessage = `<speak>Rally Start in ${options.in.asSeconds()} Sekunden. Die Startreihenfolge ist: `

            rallyWithDuration.forEach(rally => {
                startMessage += `${rally.player}, `
            })

            startMessage += '</speak>'


            countdowns.push({
                message: startMessage,
                timeout: 0
            })
            countdowns.push({
                message: this.createCountDown(firstRallyToStart.player, 10),
                timeout: startTimeout - defaultSpeechDuration + (firstRallyToStart.order * 1000)
            })

            for (let i = 1; i < rallyWithDuration.length; i++) {
                const rally = rallyWithDuration[i]
                const delay = rally.order * 1000
                const offset = Math.abs(Math.abs(firstRallyToStart.offsetToFirstRally) - Math.abs(rally.offsetToFirstRally))
                const counts = offset / 1000
                const speechDuration = (counts > 10 ? 10 : counts) * 1000
                let timeout = startTimeout + offset - speechDuration + delay

                countdowns.push({
                    message: this.createCountDown(rally.player, counts),
                    timeout: timeout
                })
            }
        }

        return countdowns
    }


    private createCountDown(player: string, counts: number) {
        let max10Counts = counts <= 10 ? counts : 10
        let countDownText = player

        for (let i = 1; i <= max10Counts; i++) {
            const key = i.toString()
            // @ts-ignore
            countDownText = `${i}<break time="${this.countDownBreaks[key]}" />` + countDownText
        }

        return `<speak>${countDownText}</speak>`
    }

}
