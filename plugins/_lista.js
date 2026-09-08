import fs from 'fs'
let db = './src/database/lista.json'

if (!fs.existsSync('./src/database')) fs.mkdirSync('./src/database')
if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

let handler = async (m, { conn, text, command }) => {
    let data = JSON.parse(fs.readFileSync(db))

    // Hora Perú GMT-5
    let fecha = new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima', weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    let diaSemana = new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima', weekday: 'long' })
    let diasValidos = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

    if (!diasValidos.includes(diaSemana.toLowerCase())) {
        return m.reply('⛔ Solo se puede anotar de Lunes a Sábado')
    }

    //.lista1 = VER TABLA
    if (command === 'lista1') {
        if (data.length === 0) return m.reply('📝 *LISTA VACÍA*')

        let tabla = `📋 *LISTA LUNES A SÁBADO*\n*Hoy:* ${fecha}\n\n`
        data.forEach((v, i) => {
            tabla += `*${i+1}.* ${v.nombre} [${v.rol}]\n 📱 ${v.numero}\n 📅 ${v.dia}\n\n`
        })
        return conn.reply(m.chat, tabla, m)
    }

    //.lista = ANOTAR
    if (command === 'lista') {
        if (!text) return m.reply(`❌ Usa:.lista Nombre/Numero/Rol\nEj:.lista Fersy/+518292/Bot`)

        let [nombre, numero, rol] = text.split('/').map(v => v.trim())
        if (!nombre ||!numero ||!rol) return m.reply(`❌ Faltan datos\nUsa:.lista Nombre/Numero/Rol`)

        // Revisa si ya se anotó hoy
        let yaAnotado = data.find(v => v.numero === numero && v.dia === fecha)
        if (yaAnotado) return m.reply(`⚠️ ${nombre} ya fue anotado hoy *${fecha}*`)

        data.push({ nombre, numero, rol, dia: fecha })
        fs.writeFileSync(db, JSON.stringify(data, null, 2))
        return m.reply(`✅ *ANOTADO*\n\n*Nombre:* ${nombre}\n*Número:* ${numero}\n*Rol:* ${rol}\n*Día:* ${fecha}`)
    }

    //.borrartodo = BORRAR TODO
    if (command === 'borrartodo') {
        if (!m.isAdmin &&!m.isOwner) return m.reply('❌ Solo admins')
        fs.writeFileSync(db, JSON.stringify([]))
        return m.reply('🗑️ *LISTA BORRADA*')
    }
}

handler.help = ['lista1', 'lista nombre/numero/rol', 'borrartodo']
handler.tags = ['group']
handler.command = /^(lista1|lista|borrartodo)$/i
handler.group = true

export default handler