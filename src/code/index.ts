import * as https from 'https'
import * as fs from 'fs'
import Settings from "../settings/settings";
import Logger from '../logger'
import CodeData from "./code-data";

const jsdom = require('jsdom')
const logger = Logger.createLogger()

export default class Code {
    static CODE_STORAGE = 'code-storage.txt'
    static CODE_SOURCE = 'https://www.mejoress.com/en/state-of-survival-code-redeem-codes/'

    private callback: (data: CodeData) => void
    private settings: Settings

    constructor(settings: Settings) {
        this.callback = () => {
        }
        this.settings = settings
    }

    onCodeFound(cb: (data: CodeData) => void): void {
        this.callback = cb
    }

    async searchCode() {
        try {
            const code = await this.fetchCode()


            if (!!code && !this.codeAlreadyKnown(code)) {
                this.storeCode(code)
                this.callback(this.getLatestCode())
            }

        } catch (error) {
            logger.error(`Failed to load latest promo code.`, error)
        }
    }

    async fetchCode() {
        return new Promise<string>((resolve, reject) => {
            let code = ''

            https.get(Code.CODE_SOURCE, response => {
                let data = ''

                response.on('data', chunk => {
                    data += chunk
                })

                response.on('end', () => {
                    const root = new jsdom.JSDOM(data)
                    const document = root.window.document
                    const liElements = document.getElementsByTagName('li')

                    for (let i = 0; i < liElements.length; i++) {
                        const li = liElements[i]
                        const text = li.textContent

                        if (text.endsWith(': Redeem this code before expires')) {
                            code = text.replace(': Redeem this code before expires', '')
                            break;
                        }
                    }

                    resolve(code)
                })
            }).on('error', reject)
        })
    }

    getLatestCode(): CodeData {
        let data: CodeData = {
            code: '',
            timestamp: new Date()
        }
        try {
            const content = fs.readFileSync(`${this.settings.workingDir}/${Code.CODE_STORAGE}`, 'utf8')

            data = JSON.parse(content)
        } catch (error) {
            logger.error(`Could not load code from store.`, error)
        }

        return data
    }

    private storeCode(code: string): void {
        logger.info(`Storing new code: ${code}`)

        try {
            const data: CodeData = {
                code,
                timestamp: new Date()
            }
            fs.writeFileSync(`${this.settings.workingDir}/${Code.CODE_STORAGE}`, JSON.stringify(data))
        } catch (error) {
            logger.error(`Could not store code ${code}.`, error)
        }
    }

    private codeAlreadyKnown(code: string): boolean {
        const data = this.getLatestCode()
        return !!data && this.getLatestCode()?.code === code
    }

}
