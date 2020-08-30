export default interface Settings {
    botToken: string,
    textChannelId: string
    voiceChannelId: string
    workingDir: string
    playerDataSource?: string
    awsRegion: string
}
