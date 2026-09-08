import fs from 'fs'
let db = './src/database/lista.json'

if (!fs.existsSync('./src/database')) fs.mkdirSync('./src/database', { recursive: true })
if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let data = JSON.parse(fs.readFileSync(db))

    // Fecha y día de Perú
    let now = new Date()
    let fecha = now.toLocaleDateString('es-PE', { timeZone: 'America/Lima', weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    let diaSemana = now.toLocaleDateString('es-PE', { timeZone: 'America/Lima', weekday: 'long' }).toLowerCase()

    let diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

    //.verlista = MOSTRAR TODOS LOS DÍAS LUNES A SÁBADO
    if (command === 'verlista') {
        let tabla = `📋 *LISTA COMPLETA LUNES A SÁBADO*\n\n`

        diasSemana.forEach(dia => {
            // Buscar anotados de ese día
            let anotadosDelDia = data.filter(v => v.dia.toLowerCase().includes(dia))

            tabla += `*📌 ${dia.toUpperCase()}*\n`

            if (anotadosDelDia.length === 0) {
                tabla += ` _Sin anotados_\n\n`
            } else {
                anotadosDelDia.forEach((v, i) => {
                    tabla += ` *${i+1}.* ${v.nombre} [${v.rol}]\n 📱 ${v.numero}\n 📅 ${v.dia}\n\n`
                })
            }
        })

        return conn.reply(m.chat, tabla.trim(), m)
    }

    //.lista = ANOTAR
    if (command === 'lista') {
        // Solo Lunes a Sábado
        if (!diasSemana.includes(diaSemana)) {
            return m.reply('⛔ *FUERA DE HORARIO*\nSolo se puede anotar de *Lunes a Sábado*')
        }

        if (!text) return m.reply(`❌ *Formato incorrecto*\nUsa: ${usedPrefix}lista Nombre/Numero/Rol\nEj: ${usedPrefix}lista fetsy/618282/bot`)

        let [nombre, numero, rol] = text.split('/').map(v => v.trim())
        if (!nombre ||!numero ||!rol) return m.reply(`❌ *Faltan datos*\nUsa: ${usedPrefix}lista Nombre/Numero/Rol`)

        // Verificar si ya se anotó hoy
        let yaAnotado = data.find(v => v.numero === numero && v.dia === fecha)
        if (yaAnotado) return m.reply(`⚠️ *YA ANOTADO*\n${nombre} ya fue anotado hoy *${fecha}*`)

        data.push({ nombre, numero, rol, dia: fecha })
        fs.writeFileSync(db, JSON.stringify(data, null, 2))

        return m.reply(`✅ *ANOTADO CORRECTAMENTE*\n\n*Nombre:* ${nombre}\n*Número:* ${numero}\n*Rol:* ${rol}\n*Día:* ${fecha}`)
    }
}

handler.help = ['lista nombre/numero/rol', 'verlista']
handler.tags = ['group']
handler.command = /^(lista|verlista)$/i // <-- Cambiado aquí
handler.group = true

export default handler
