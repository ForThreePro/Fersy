import fs from 'fs'
let db = './src/database/lista.json'

if (!fs.existsSync('./src/database')) fs.mkdirSync('./src/database', { recursive: true })
if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

let handler = async (m, { conn, command }) => {
    if (command === 'borrarlista') {
        fs.writeFileSync(db, JSON.stringify([]))
        return m.reply('🗑️ *LISTA BORRADA COMPLETAMENTE*\nSe eliminaron todos los registros de Lunes a Sábado')
    }
}

handler.help = ['borrarlista']
handler.tags = ['group']
handler.command = /^(borrarlista)$/i
handler.admin = true
handler.group = true

export default handler