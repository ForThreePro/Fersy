import fs from 'fs'
let db = './src/database/lista.json'

if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

let handler = async (m, { conn, command }) => {
    if (command === 'borrartodo') {
        if (!m.isAdmin && !m.isOwner) return m.reply('❌ Solo admins pueden borrar la lista')
        fs.writeFileSync(db, JSON.stringify([]))
        return m.reply('🗑️ *LISTA BORRADA COMPLETA*')
    }
}

handler.help = ['borrartodo']
handler.tags = ['admin']
handler.command = /^(borrartodo)$/i
handler.group = true
handler.admin = true

export default handler