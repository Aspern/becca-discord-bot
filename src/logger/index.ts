import winston from 'winston'

class Index {

    createLogger() {
        return winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
            ),
            transports: [
                new winston.transports.File({ filename: '/tmp/becca/becca.log', level: 'info' }),
                new winston.transports.Console()
            ]
        })
    }
}

export default new Index()
