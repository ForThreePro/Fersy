import fs from 'fs'
let db = './src/database/lista.json'

if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

let handler = async (m, { conn, text, command }) => {
    let data = JSON.parse(fs.readFileSync(db))

    //.eliminar = BORRAR 1 PERSONA - SOLO ADMIN
    if (command === 'eliminar') {
        if (!m.isAdmin &&!m.isOwner) return m.reply('❌ Solo admins pueden eliminar')
        if (!text) return m.reply('Usa: `.eliminar Nombre` o `.eliminar +51xxxx`')

        let index = data.findIndex(v => v.nombre.toLowerCase().includes(text.toLowerCase()) || v.numero.includes(text))
        if (index === -1) return m.reply('❌ No se encontró a esa persona en la lista')

        let eliminado = data.splice(index, 1)[0]
        fs.writeFileSync(db, JSON.stringify(data, null, 2))
        return m.reply(`🗑️ *ELIMINADO*\n${eliminado.nombre} fue eliminado de la lista.`)
    }

    //.borrartodo = BORRAR TODO - SOLO ADMIN
    if (command === 'borrartodo') {
        if (!m.isAdmin &&!m.isOwner) return m.reply('❌ Solo admins pueden borrar la lista')
        fs.writeFileSync(db, JSON.stringify([]))
        return m.reply('🗑️ *LISTA BORRADA*\nSe reinició la lista completa.')
    }
}

handler.help = ['eliminar nombre', 'borrartodo']
handler.tags = ['admin']
handler.command = ['eliminar', 'borrartodo']
handler.group = true
handler.admin = true // Solo admins

export default handler