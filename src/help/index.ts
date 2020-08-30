const AsciiTable = require('ascii-table')

class Help {

    print() {
        const table = new AsciiTable()

        table.addRow(
            'becca:help',
            '',
            'Zeigt alle vergügbaren Befehle im Chat an'
        )

        table.addRow(
            'becca:code',
            '',
            'Gibt den neuesten Code im Chat zurück'
        )

        table.addRow(
            'becca:alliance',
            '[sorter=<Spalte>]',
            'Zeigt eine Tabelle mit den 10 stärksten Spielern im Chat an (sortierbar nach Spalte)'
        )

        table.addRow(
            'becca:rally',
            'in <x> minutes',
            'Koordiniert eine Menge von Rallys zum Zielzeitpunkt'
        )

        table.addRow(
            '',
            '[<player>#<rally>#<march>, ...]',
            ''
        )

        return `\`\`\`\n${table.toString()}\n\`\`\``
    }

}

export default new Help()
