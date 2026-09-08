import fs from 'fs'
let db = './src/database/lista.json'

if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

let handler = async (m, { conn, text, command }) => {
    let data = JSON.parse(fs.readFileSync(db))
    let fechaHoy = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })

    //.lista1 = VER TABLA
    if (command === 'lista1') {
        if (data.length === 0) return m.reply('📝 *LISTA VACÍA*\nAún nadie se ha anotado. Usa `.lista nombre | número`')

        let tabla = '📋 *LISTA DE ANOTADOS*\n\n'
        data.forEach((v, i) => {
            let veces = v.fechas.length
            let fechas = v.fechas.join('\n • ')
            tabla += `*${i+1}.* ${v.nombre}\n 📱 ${v.numero}\n 🏆 Veces: ${veces}/2\n 📅 Días:\n • ${fechas}\n\n`
        })
        return conn.reply(m.chat, tabla, m)
    }

    //.lista = ANOTAR
    if (command === 'lista') {
        if (!text) return m.reply('❌ Formato incorrecto\nUsa: `.lista Nombre | +51xxxxxxxxx`\nEj: `.lista Fersy | +519772727272`')

        let [nombre, numero] = text.split('|').map(v => v.trim())
        if (!nombre ||!numero) return m.reply('❌ Formato incorrecto\nUsa: `.lista Nombre | +51xxxxxxxxx`')

        let existe = data.find(v => v.numero === numero)

        if (existe) {
            // REGLA: MÁXIMO 2 VECES
            if (existe.fechas.length >= 2) {
                return m.reply(`⛔ *LÍMITE ALCANZADO*\n\n${existe.nombre} ya se anotó 2 veces.\nVuelve a sortear o no contará tu sorteo.`)
            }
            if (existe.fechas.includes(fechaHoy)) {
                return m.reply(`⚠️ ${existe.nombre} ya fue anotado hoy *${fechaHoy}*`)
            }
            existe.fechas.push(fechaHoy)
            fs.writeFileSync(db, JSON.stringify(data, null, 2))
            return m.reply(`✅ *ACTUALIZADO*\n\n*${existe.nombre}*\nVeces anotado: ${existe.fechas.length}/2\nFecha agregada: *${fechaHoy}*`)
        } else {
            data.push({ nombre: nombre, numero: numero, fechas: [fechaHoy] })
            fs.writeFileSync(db, JSON.stringify(data, null, 2))
            return m.reply(`✅ *ANOTADO CORRECTAMENTE*\n\n*Nombre:* ${nombre}\n*Número:* ${numero}\n*Veces:* 1/2\n*Fecha:* ${fechaHoy}`)
        }
    }
}

handler.help = ['lista1', 'lista nombre | numero']
handler.tags = ['group']
handler.command = ['lista1', 'lista']
handler.group = true

export default handler