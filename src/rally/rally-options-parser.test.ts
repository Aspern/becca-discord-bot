import {RallyOptionParser} from "./rally-option-parser";

describe('RallyOptionsParser', () => {

    it('parses one rally with start point in minutes', () => {
        const parser = new RallyOptionParser()
        const output = parser.parse('in 120 seconds [AspernTallow#05:00#01:23]')

        expect(output.in?.asMinutes()).toBe(2)
        expect(output.at).toBeFalsy()
        expect(output.rallies.length).toBe(1)
        expect(output.rallies[0].player).toBe('AspernTallow')
        expect(output.rallies[0].rallyTimer.asMinutes()).toBe(5)
        expect(output.rallies[0].order).toBe(0)
        expect(output.rallies[0].marchDuration.asSeconds()).toBe(83)
    })

    it('parses multiple rallies', () => {
        const parser = new RallyOptionParser()
        const output = parser.parse('in 120 seconds [AspernTallow#05:00#01:23,Sanny#1:00#2:00]')

        expect(output.rallies.length).toBe(2)
        expect(output.rallies[0].player).toBe('AspernTallow')
        expect(output.rallies[0].rallyTimer.asMinutes()).toBe(5)
        expect(output.rallies[0].marchDuration.asSeconds()).toBe(83)
        expect(output.rallies[0].order).toBe(0)
        expect(output.rallies[1].player).toBe('Sanny')
        expect(output.rallies[1].rallyTimer.asMinutes()).toBe(1)
        expect(output.rallies[1].marchDuration.asSeconds()).toBe(120)
        expect(output.rallies[1].order).toBe(1)
    })

    it('returns empty options if invalid start conditions are set', () => {
        const parser = new RallyOptionParser()
        const output = parser.parse('in 10 minutes [AspernTallow#05:00#01:23]')

        expect(output.in).toBeFalsy()
        expect(output.at).toBeFalsy()
        expect(output.rallies.length).toBe(0)
    })
})
