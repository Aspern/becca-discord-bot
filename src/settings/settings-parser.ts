import Settings from './settings'
import * as fs from 'fs'

export default class SettingsParser {
    static DEFAULT_WORKING_DIR = '/tmp/becca'

    load(path: string): Settings {
        const content = fs.readFileSync(path, 'utf8')
        const settings = JSON.parse(content)

        SettingsParser.validate(settings)

        return settings;
    }

    private static validate(settings: Settings) {
        if (!settings.botToken) throw new Error("Required setting 'botToken' is missing.")
        if (!settings.workingDir) settings.workingDir = SettingsParser.DEFAULT_WORKING_DIR
    }

}
