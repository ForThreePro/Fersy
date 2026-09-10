import fs from 'fs'

const filePath = './temp_groups.json'

// LISTA DE NUMEROS AUTORIZADOS
// Pon tu numero con codigo de pais sin + ni espacios
const OWNER_NUMBERS = [
  '51927174369' // +51 927 174 369
]

if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]')
global.tempGroups = JSON.parse(fs.readFileSync(filePath))

function saveTempGroups() {
  fs.writeFileSync(filePath, JSON.stringify(global.tempGroups, null, 2))
}

// VERIFICADOR CADA 30 SEGUNDOS
setInterval(async () => {
  if (!global.conn) return
  const now = Date.now()
  let toRemove = []

  for (let i of global.tempGroups) {
    const timeLeft = i.exitTime - now

    // AVISO 5 MINUTOS ANTES
    if (timeLeft <= 300000 && timeLeft > 0 &&!i.warned) {
      try {
        await global.conn.sendMessage(i.id, {
          text: `𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ ⏰\n\n.⃟𖥔 ݁. 𖦹˙— \`\`AVISO\`\` —˙𖦹.⏰꒷\n\n── *📝 AVISO* ╏\n⏰ ➛ El bot se saldrá de este grupo en 5 minutos\n━━━━━━━━━━━`
        })
        i.warned = true
        saveTempGroups()
      } catch {}
    }

    // HORA DE SALIR
    if (now >= i.exitTime) {
      let attempts = 0
      while (attempts < 3) {
        try {
          await global.conn.sendMessage(i.id, {
            text: `𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ 👋\n\n.⃟𖥔 ݁. 𖦹˙— \`\`SALIDA\`\` —˙𖦹.👋꒷\n\n── *📝 AVISO* ╏\n⏰ ➛ Temporizador finalizado. Saliendo...\n━━━━━━━━━━━`
          })
          await new Promise(r => setTimeout(r, 1500))
          await global.conn.groupLeave(i.id)
          console.log(`[TEMP] Sali del grupo: ${i.name}`)
          break
        } catch (e) {
          attempts++
          await new Promise(r => setTimeout(r, 2000))
        }
      }
      toRemove.push(i.id)
    }
  }

  if (toRemove.length > 0) {
    global.tempGroups = global.tempGroups.filter(v =>!toRemove.includes(v.id))
    saveTempGroups()
  }
}, 30000)

const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text, key: m.key } }) } catch {}
}

function msToTime(ms) {
  if (ms < 0) ms = 0
  let d = Math.floor(ms / 86400000)
  let h = Math.floor((ms % 86400000) / 3600000)
  let m = Math.floor((ms % 3600000) / 60000)
  let s = Math.floor((ms % 60000) / 1000)
  let result = []
  if (d > 0) result.push(`${d}d`)
  if (h > 0) result.push(`${h}h`)
  if (m > 0) result.push(`${m}m`)
  if (s > 0 && d === 0) result.push(`${s}s`)
  return result.join(' ') || '0s'
}

// FUNCION PARA VERIFICAR SI ES OWNER
function isOwner(m) {
  let sender = m.sender.replace('@s.whatsapp.net', '')
  return OWNER_NUMBERS.includes(sender)
}

let handler = async (m, { conn, args, command }) => {

  // BLOQUEO PARA NO AUTORIZADOS
  if (!isOwner(m)) {
    await react(conn, m, "❌")
    return m.reply(`𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ No tienes permiso para usar este comando\n━━━━━━━━━━━`)
  }

  // COMANDO: TEMPLIST
  if (command === 'templist') {
    if (global.tempGroups.length === 0) {
      await react(conn, m, "⚠️")
      return m.reply(`𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n⚠️ ➛ No hay grupos con temporizador activo\n━━━━━━━━━━━`)
    }

    let list = global.tempGroups.map((v, i) => {
      let timeLeft = v.exitTime - Date.now()
      return `│ ${i+1}. *${v.name}*\n│ ⏰ Falta: ${msToTime(timeLeft)}`
    }).join('\n')

    let texto = `𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ 📋

.⃟𖥔 ݁. 𖦹˙— \`\`LISTA ACTIVA\`\` —˙𖦹.📋꒷

── *📊 GRUPOS* ╏
${list}

── *📝 NOTA* ╏
💡 ➛ Usa tempcancel para cancelar

━━━━━━━━━━━`
    await react(conn, m, "📋")
    return m.reply(texto)
  }

  // COMANDO: TEMPORIZADOR
  if (!m.isGroup) {
    await react(conn, m, "❌")
    return m.reply(`𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ Solo funciona en grupos\n━━━━━━━━━━━`)
  }

  if (!args[0]) {
    await react(conn, m, "❌")
    let error = `𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` —˙𖦹.⏰꒷

── *📖 USO* ╏
➛ temporizador 30d
➛ temporizador 5h
➛ temporizador 1d5h30m

── *💡 EJEMPLOS* ╏
➛ 1m = 1 minuto
➛ 2h = 2 horas
➛ 3d = 3 días

━━━━━━━━━━━`
    return m.reply(error)
  }

  let time = args[0].toLowerCase()
  let ms = 0
  let regex = /(\d+)([dhm])/g
  let match
  while ((match = regex.exec(time))!== null) {
    let val = parseInt(match[1])
    let type = match[2]
    if (type === 'd') ms += val * 86400000
    if (type === 'h') ms += val * 3600000
    if (type === 'm') ms += val * 60000
  }
  if (ms < 60000) {
    await react(conn, m, "❌")
    return m.reply(`𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ Mínimo 1 minuto\n━━━━━━━━━━━`)
  }

  const exitTime = Date.now() + ms
  const groupId = m.chat
  const groupName = await conn.getName(groupId)

  let index = global.tempGroups.findIndex(v => v.id === groupId)
  if (index!== -1) global.tempGroups.splice(index, 1)

  global.tempGroups.push({ id: groupId, name: groupName, exitTime, addedBy: m.sender, warned: false })
  saveTempGroups()

  const fecha = new Date(exitTime).toLocaleString('es-PE', { timeZone: 'America/Lima' })

  let ok = `𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`ACTIVADO\`\` —˙𖦹.⏰꒷

── *📊 INFORMACIÓN* ╏
🏠 ➛ Grupo: ${groupName}
⏰ ➛ Salida en: ${msToTime(ms)}
📅 ➛ Fecha: ${fecha}

── *📝 NOTA* ╏
🗑️ ➛ Usa tempcancel para cancelar

━━━━━━━━━━━`
  await react(conn, m, "✅")
  return m.reply(ok)
}

// CANCELAR
handler.before = async (m, { conn, command }) => {
  if (command === 'tempcancel') {

    // BLOQUEO PARA NO AUTORIZADOS
    if (!isOwner(m)) {
      await react(conn, m, "❌")
      return m.reply(`𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ No tienes permiso para usar este comando\n━━━━━━━━━━━`)
    }

    if (!m.isGroup) {
      await react(conn, m, "❌")
      return m.reply(`𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ Solo funciona en grupos\n━━━━━━━━━━━`)
    }

    let index = global.tempGroups.findIndex(v => v.id === m.chat)
    if (index === -1) {
      await react(conn, m, "⚠️")
      return m.reply(`𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n⚠️ ➛ No hay temporizador activo\n━━━━━━━━━━━`)
    }

    const groupName = global.tempGroups[index].name
    global.tempGroups.splice(index, 1)
    saveTempGroups()

    let cancel = `𐔌 ꒱ ***TEMPORIZADOR*** 𐔌 ꒱ 🗑️

.⃟𖥔 ݁. 𖦹˙— \`\`CANCELADO\`\` —˙𖦹.🗑️꒷

── *📊 INFORMACIÓN* ╏
🏠 ➛ Grupo: ${groupName}
✅ ➛ Estado: Cancelado

━━━━━━━━━━━`
    await react(conn, m, "🗑️")
    return m.reply(cancel)
  }
}

handler.help = ['temporizador 30d', 'tempcancel', 'templist'];
handler.tags = ['group'];
handler.command = ['temporizador', 'temp', 'tempcancel', 'templist'];
handler.admin = false

export default handler;