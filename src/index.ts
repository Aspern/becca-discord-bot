#!/usr/bin/env node

import {program} from 'commander';
// @ts-ignore
import * as packageInfo from '../package.json'
import Becca from './becca'
import Logger from './logger'
import SettingsParser from "./settings/settings-parser";
import * as fs from 'fs'
import Settings from "./settings/settings";

const logger = Logger.createLogger()

function initWorkingDir(settings: Settings) {
    const workingDir = settings.workingDir
    const folders = workingDir.split('/')
    let path = ''

    logger.info(`Trying to create working directory at ${workingDir}.`)

    folders.forEach(folder => {
        if (!!folder) {
            path += `/${folder}`

            try {
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path)
                }
            } catch (error) {
                logger.error(`Could not init working directory at ${workingDir}`, error)
                process.exit(1)
            }
        }
    })
}

program
    .version(packageInfo.version)
    .command('start')
    .requiredOption('-s, --settings <path>', 'path to settings.json file')
    .description('Starts becca discord bot')
    .action(async (options: { settings: string }) => {
        const parser = new SettingsParser()
        const settings = parser.load(options.settings)
        const becca = new Becca(settings)

        initWorkingDir(settings)

        await becca.wakeUp()
    })
    .parse(process.argv)
