import fs from 'fs'
let db = './src/database/lista.json'

if (!fs.existsSync('./src/database')) fs.mkdirSync('./src/database', { recursive: true })
if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

let handler = async (m, { conn, text }) => {
    let data = JSON.parse(fs.readFileSync(db))

    // Fecha y día de Perú
    let now = new Date()
    let fecha = now.toLocaleDateString('es-PE', { timeZone: 'America/Lima', weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    let diaSemana = now.toLocaleDateString('es-PE', { timeZone: 'America/Lima', weekday: 'long' }).toLowerCase()

    let diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    //.verlista = MOSTRAR TODOS LOS DÍAS LUNES A SÁBADO
    if (m.message?.extendedTextMessage?.text?.includes('verlista') || m.text?.includes('verlista')) {
        await react('📋')
        let tabla = `𐔌 ꒱ ***LISTA SEMANAL*** 𐔌 ꒱ 📋

.⃟𖥔 ݁. 𖦹˙— \`\`REGISTROS\`\` —˙𖦹.📅꒷

── *📊 INFORMACIÓN* ╏
📅 ➛ Periodo: *Lunes a Sábado*
🕒 ➛ Actualizado: *${fecha}*

━━━━━━━━━━━
`

        diasSemana.forEach(dia => {
            let anotadosDelDia = data.filter(v => v.dia.toLowerCase().includes(dia))
            tabla += `── *${dia.toUpperCase()}* ╏\n`

            if (anotadosDelDia.length === 0) {
                tabla += `📭 ➛ Sin anotados\n\n`
            } else {
                anotadosDelDia.forEach((v, i) => {
                    tabla += `${i+1}️⃣ ➛ *${v.nombre}* [${v.rol}]\n`
                    tabla += `   📱 ➛ ${v.numero}\n`
                    tabla += `   📅 ➛ ${v.dia}\n\n`
                })
            }
        })
        tabla += `━━━━━━━━━━━\n📦 ➛ Total: *${data.length}* registro${data.length !== 1 ? 's' : ''}`
        return conn.sendMessage(m.chat, { text: tabla.trim() }, { quoted: m })
    }

    //.lista = ANOTAR
    if (m.message?.extendedTextMessage?.text?.includes('lista') || m.text?.includes('lista')) {
        if (!diasSemana.includes(diaSemana)) {
            await react('⛔')
            let fueraHorario = `𐔌 ꒱ ***LISTA*** 𐔌 ꒱ ⛔

.⃟𖥔 ݁. 𖦹˙— \`\`FUERA DE HORARIO\`\` —˙𖦹.📅꒷

── *📝 AVISO* ╏
❌ ➛ Solo se puede anotar de
❌ ➛ *Lunes a Sábado*

━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: fueraHorario }, { quoted: m })
        }

        if (!text) {
            await react('❌')
            let formato = `𐔌 ꒱ ***LISTA*** 𐔌 ꒱ 📝

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` —˙𖦹.📋꒷

── *📖 USO* ╏
➛ Envía: Nombre/Numero/Rol

── *💡 EJEMPLO* ╏
➛ fetsy/618282/bot

━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: formato }, { quoted: m })
        }

        let [nombre, numero, rol] = text.split('/').map(v => v.trim())
        if (!nombre ||!numero ||!rol) {
            await react('❌')
            let faltan = `𐔌 ꒱ ***LISTA*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`FALTAN DATOS\`\` —˙𖦹.❌꒷

── *📖 FORMATO* ╏
➛ Nombre/Numero/Rol

── *💡 EJEMPLO* ╏
➛ fetsy/618282/bot

━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: faltan }, { quoted: m })
        }

        let yaAnotado = data.find(v => v.numero === numero && v.dia === fecha)
        if (yaAnotado) {
            await react('⚠️')
            let duplicado = `𐔌 ꒱ ***LISTA*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`YA ANOTADO\`\` —˙𖦹.📋꒷

── *📝 AVISO* ╏
⚠️ ➛ ${nombre} ya fue anotado hoy
📅 ➛ *${fecha}*

━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: duplicado }, { quoted: m })
        }

        data.push({ nombre, numero, rol, dia: fecha })
        fs.writeFileSync(db, JSON.stringify(data, null, 2))
        await react('✅')

        let ok = `𐔌 ꒱ ***LISTA*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`ANOTADO\`\` —˙𖦹.📋꒷

── *📊 DATOS* ╏
👤 ➛ Nombre: *${nombre}*
📱 ➛ Número: *${numero}*
💼 ➛ Rol: *${rol}*
📅 ➛ Día: *${fecha}*

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: ok }, { quoted: m })
    }
}

handler.help = ['lista nombre/numero/rol', 'verlista']
handler.tags = ['grupo']
handler.command = /^(lista|verlista)$/i
handler.group = true
export default handler