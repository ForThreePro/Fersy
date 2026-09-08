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
        let tabla = `╭─「 📋 *LISTA SEMANAL* 」\n│ *Periodo:* Lunes a Sábado\n│ *Actualizado:* ${fecha}\n╰────────────────────\n\n`

        diasSemana.forEach(dia => {
            let anotadosDelDia = data.filter(v => v.dia.toLowerCase().includes(dia))
            tabla += `📌 *${dia.toUpperCase()}*\n`

            if (anotadosDelDia.length === 0) {
                tabla += ` └ _Sin anotados_\n\n`
            } else {
                anotadosDelDia.forEach((v, i) => {
                    tabla += ` ├─ *${i+1}.* ${v.nombre} [${v.rol}]\n`
                    tabla += ` │  📱 ${v.numero}\n`
                    tabla += ` │  📅 ${v.dia}\n\n`
                })
            }
        })
        tabla += `╰─ Total: ${data.length} registro${data.length !== 1 ? 's' : ''}`
        return conn.reply(m.chat, tabla.trim(), m)
    }

    //.lista = ANOTAR
    if (command === 'lista') {
        if (!diasSemana.includes(diaSemana)) {
            return m.reply(`╭─「 ⛔ *FUERA DE HORARIO* 」
│ 
│ Solo se puede anotar de 
│ *Lunes a Sábado*
╰──────────────────`)
        }

        if (!text) return m.reply(`╭─「 ❌ *FORMATO INCORRECTO* 」
│ 
│ Usa: ${usedPrefix}lista Nombre/Numero/Rol
│ Ej: ${usedPrefix}lista fetsy/618282/bot
╰──────────────────`)

        let [nombre, numero, rol] = text.split('/').map(v => v.trim())
        if (!nombre ||!numero ||!rol) return m.reply(`╭─「 ❌ *FALTAN DATOS* 」
│ 
│ Usa: ${usedPrefix}lista Nombre/Numero/Rol
╰──────────────────`)

        let yaAnotado = data.find(v => v.numero === numero && v.dia === fecha)
        if (yaAnotado) return m.reply(`╭─「 ⚠️ *YA ANOTADO* 」
│ 
│ ${nombre} ya fue anotado hoy
│ *${fecha}*
╰──────────────────`)

        data.push({ nombre, numero, rol, dia: fecha })
        fs.writeFileSync(db, JSON.stringify(data, null, 2))

        return m.reply(`╭─「 ✅ *ANOTADO CORRECTAMENTE* 」
│ 
│ *Nombre:* ${nombre}
│ *Número:* ${numero}
│ *Rol:* ${rol}
│ *Día:* ${fecha}
╰──────────────────`)
    }
}

handler.help = ['lista nombre/numero/rol', 'verlista']
handler.tags = ['group']
handler.command = /^(lista|verlista)$/i
handler.group = true

export default handler