import fs from 'fs'
let db = './src/database/lista.json'

if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let data = JSON.parse(fs.readFileSync(db))
    let fechaHoy = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })

    switch(command) {
        case 'lista1': {
            if (data.length === 0) return m.reply('📝 *LISTA VACÍA*\nAún nadie se ha anotado. Usa `.lista nombre | número | rol`')

            let tabla = '📋 *LISTA DE ANOTADOS*\n\n'
            data.forEach((v, i) => {
                let veces = v.fechas.length
                let fechas = v.fechas.join('\n • ')
                tabla += `*${i+1}.* ${v.nombre} [${v.rol}]\n 📱 ${v.numero}\n 🏆 Veces: ${veces}/2\n 📅 Días:\n • ${fechas}\n\n`
            })
            return conn.reply(m.chat, tabla, m)
        }

        case 'lista': {
            if (!text) return m.reply(`❌ Formato incorrecto\nUsa: ${usedPrefix}lista Nombre | +51xxxxxxxxx | Rol\nEj: ${usedPrefix}lista Fersy | +519772727272 | Bot`)

            let [nombre, numero, rol] = text.split('|').map(v => v.trim())
            if (!nombre ||!numero ||!rol) return m.reply(`❌ Faltan datos\nUsa: ${usedPrefix}lista Nombre | +51xxxxxxxxx | Rol`)

            let existe = data.find(v => v.numero === numero)

            if (existe) {
                if (existe.fechas.length >= 2) {
                    return m.reply(`⛔ *LÍMITE ALCANZADO*\n\n${existe.nombre} ya se anotó 2 veces.\nVuelve a sortear o no contará tu sorteo.`)
                }
                if (existe.fechas.includes(fechaHoy)) {
                    return m.reply(`⚠️ ${existe.nombre} ya fue anotado hoy *${fechaHoy}*`)
                }
                existe.fechas.push(fechaHoy)
                fs.writeFileSync(db, JSON.stringify(data, null, 2))
                return m.reply(`✅ *ACTUALIZADO*\n\n*${existe.nombre}* [${existe.rol}]\nVeces anotado: ${existe.fechas.length}/2\nFecha agregada: *${fechaHoy}*`)
            } else {
                data.push({ nombre, numero, rol, fechas: [fechaHoy] })
                fs.writeFileSync(db, JSON.stringify(data, null, 2))
                return m.reply(`✅ *ANOTADO CORRECTAMENTE*\n\n*Nombre:* ${nombre}\n*Número:* ${numero}\n*Rol:* ${rol}\n*Veces:* 1/2\n*Fecha:* ${fechaHoy}`)
            }
        }
    }
}

handler.help = ['lista1', 'lista nombre | numero | rol']
handler.tags = ['group']
handler.command = /^(lista1|lista)$/i // Regex para que lo detecte si o si
handler.group = true

export default handler