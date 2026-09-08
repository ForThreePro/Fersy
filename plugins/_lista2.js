import fs from 'fs'
let db = './src/database/lista.json'

if (!fs.existsSync('./src/database')) fs.mkdirSync('./src/database', { recursive: true })
if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

let handler = async (m, { conn, command }) => {
    if (command === 'borrarlista') {
        
        let data = JSON.parse(fs.readFileSync(db))
        let total = data.length
        
        if (total === 0) return m.reply('📭 *LA LISTA YA ESTÁ VACÍA*\nNo hay registros para borrar.')

        fs.writeFileSync(db, JSON.stringify([]))

        let texto = `╭─「 🗑️ *BORRADO EXITOSO* 」
│ 
│ *Se eliminaron:* ${total} registro${total > 1 ? 's' : ''}
│ *Rango:* Lunes a Sábado
│ *Hora:* ${new Date().toLocaleTimeString('es-PE', {timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit'})}
│ 
╰─「 *LISTA REINICIADA* 」`

        return m.reply(texto)
    }
}

handler.help = ['borrarlista']
handler.tags = ['group']
handler.command = /^(borrarlista)$/i
handler.group = true
handler.admin = true

export default handler