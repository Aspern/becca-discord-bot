import RallyHelper from "./rally-helper";
import {RallyOptions} from "./rally-options";
import moment from "moment";

describe('RallyHelper', () => {

    it('produces correct countdown for one rally in 2 minutes', () => {
        const helper = new RallyHelper()
        const options: RallyOptions = {
            in: moment.duration(120, 'seconds'),
            rallies: [
                {
                    player: 'AspernTallow',
                    order: 0,
                    rallyTimer: moment.duration(1, 'minutes'),
                    marchDuration: moment.duration(115, 'seconds')
                }
            ]
        }
        const countdowns = helper.createRallyCountdowns(options)

        expect(countdowns.length).toBe(2)
        expect(countdowns[0].timeout).toBe(0)
        expect(countdowns[0].message).toBe('<speak>Rally Start in 120 Sekunden. Die Startreihenfolge ist: AspernTallow, </speak>')
        expect(countdowns[1].timeout).toBe((2 * 60 * 1000) - (10 * 1000)) // wait 2 minutes and 10 seconds for countdown
    })

    it('produces correct countdown for two rallies', () => {
        const helper = new RallyHelper()
        const options: RallyOptions = {
            in: moment.duration(60, 'seconds'),
            rallies: [
                {
                    player: 'AspernTallow',
                    order: 0,
                    rallyTimer: moment.duration(5, 'minutes'),
                    marchDuration: moment.duration(58, 'seconds')
                },
                {
                    player: 'Sanny',
                    order: 1,
                    rallyTimer: moment.duration(5, 'minutes'),
                    marchDuration: moment.duration(17, 'seconds')
                }
            ]
        }
        const countdowns = helper.createRallyCountdowns(options)

        expect(countdowns.length).toBe(3)
        expect(countdowns[0].message).toBe('<speak>Rally Start in 60 Sekunden. Die Startreihenfolge ist: AspernTallow, Sanny, </speak>')
        expect(countdowns[1].timeout).toBe((60 * 1000) /* 1min */ - (10 * 1000)) /* ctd speech */
        expect(countdowns[2].timeout).toBe((60 * 1000) /* 1min */ + (42 * 1000) /* march offset + 1 sec */ - (10 * 1000))  /* ctd speech */
    })

    it('produces correct countdown for two inverse rallies', () => {
        const helper = new RallyHelper()
        const options: RallyOptions = {
            in: moment.duration(30, 'seconds'),
            rallies: [
                {
                    player: 'AspernTallow',
                    order: 0,
                    rallyTimer: moment.duration(5, 'minutes'),
                    marchDuration: moment.duration(42, 'seconds')
                },
                {
                    player: 'Nekro',
                    order: 1,
                    rallyTimer: moment.duration(5, 'minutes'),
                    marchDuration: moment.duration(65, 'seconds')
                }
            ]
        }
        const countdowns = helper.createRallyCountdowns(options)

        expect(countdowns.length).toBe(3)
        expect(countdowns[0].message).toBe('<speak>Rally Start in 30 Sekunden. Die Startreihenfolge ist: Nekro, AspernTallow, </speak>')
        expect(countdowns[1].timeout).toBe((30 * 1000) /* 1min */ - (10 * 1000) /* ctd speech */ + (1000)) /* delay */
        expect(countdowns[2].timeout).toBe((30 * 1000) /* 1min */ + (23 * 1000) /* march offset + 1 sec */ - (10 * 1000))  /* ctd speech */
    })

    it('shortens countdown if necessary', () => {
        const helper = new RallyHelper()
        const options: RallyOptions = {
            in: moment.duration(60, 'seconds'),
            rallies: [
                {
                    player: 'AspernTallow',
                    order: 0,
                    rallyTimer: moment.duration(5, 'minutes'),
                    marchDuration: moment.duration(24, 'seconds')
                },
                {
                    player: 'Sanny',
                    order: 1,
                    rallyTimer: moment.duration(5, 'minutes'),
                    marchDuration: moment.duration(17, 'seconds')
                }
            ]
        }
        const countdowns = helper.createRallyCountdowns(options)

        expect(countdowns.length).toBe(3)
        expect(countdowns[0].message).toBe('<speak>Rally Start in 60 Sekunden. Die Startreihenfolge ist: AspernTallow, Sanny, </speak>')
        expect(countdowns[1].timeout).toBe((60 * 1000) /* 1min */ - (10 * 1000)) /* ctd speech */
        expect(countdowns[2].timeout).toBe((60 * 1000) /* 1min */ + (7 * 1000) /* march offset */ + (1000) /* 1sec delay */ - (7 * 1000))  /* ctd speech */
    })


})
