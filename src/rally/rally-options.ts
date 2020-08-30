import {Duration, Moment} from 'moment'

interface RallyCountdown {
    timeout: number,
    message: string
}

interface Rally {
    player: string,
    order: number,
    marchDuration: Duration,
    rallyTimer: Duration
}

interface RallyOptions {
    in?: Duration
    at?: Moment
    rallies: Rally[]
}

export {RallyOptions, Rally, RallyCountdown}
