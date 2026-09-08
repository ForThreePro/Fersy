import fs from 'fs'
let db = './src/database/lista.json'

if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

let handler = async (m, { conn, command }) => {
    if (command === 'borrarlista') {
        // Solo admins y owner
        if (!m.isAdmin && !m.isOwner) return m.reply('❌ *SIN PERMISO*\nSolo admins pueden usar este comando')
        
        fs.writeFileSync(db, JSON.stringify([]))
        return m.reply('🗑️ *LISTA BORRADA COMPLETAMENTE*\nSe eliminaron todos los registros de Lunes a Sábado')
    }
}

handler.help = ['borrarlista']
handler.tags = ['admin']
handler.command = /^(borrarlista)$/i // <-- Cambiado aquí
handler.group = true
handler.admin = true // Esto ya bloquea que no-admins lo usen

export default handler