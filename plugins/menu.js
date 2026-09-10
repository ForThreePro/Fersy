import os from 'os'
import { performance } from 'perf_hooks'

// TU IMAGEN FIJA
const GARFIELD_IMG = 'https://files.evogb.win/QFXQtu.jpg'

let handler = async (m, { conn, usedPrefix }) => {
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  await react('⏳')
  await conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ ⏳\n\n── *📊 ESTADO* ╏\n⏳ ➛ Cargando menú...` }, { quoted: m })

  let taguser = m.mentionedJid && m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : m.sender

  // TU FOTO FIJA
  let img = { url: GARFIELD_IMG }

  let uptime = process.uptime() * 1000
  let _uptime = clockString(uptime)
  let totalreg = Object.keys(global.db.data.users).length
  let totalcmd = Object.values(global.plugins).filter(p => p.help &&!p.disabled).length
  let start = performance.now()
  await conn.sendMessage(m.chat, { text: 'ping' }, { quoted: m })
  let end = performance.now()
  let ping = (end - start).toFixed(2)

  let owner = global.owner?.[0]?.[0] || '51927174369'
  let ownerTag = `@${owner}`
  let numBot = conn.user.jid.split('@')[0]

  let help = Object.values(global.plugins).filter(p => p.help &&!p.disabled)
  let groups = {}
  for (let plugin of help) {
    let category = plugin.tags? plugin.tags[0] : 'otros'
    if (!groups[category]) groups[category] = []
    if (Array.isArray(plugin.help)) groups[category].push(...plugin.help)
    else groups[category].push(plugin.help)
  }

  const icons = {
    search: '🔍', download: '⬇️', game: '🎮', rpg: '⚔️', config: '⚙️',
    group: '👥', owner: '👑', info: 'ℹ️', fun: '😂', anime: '🌸',
    sticker: '🧩', tools: '🛠️', nsfw: '🔞', audio: '🎵', prem: '💎', otros: '📁'
  }

  const categoryNames = {
    search: 'BÚSQUEDA', download: 'DESCARGAS', game: 'JUEGOS', rpg: 'RPG',
    config: 'CONFIGURACIÓN', group: 'GRUPOS', owner: 'OWNER', info: 'INFORMACIÓN',
    fun: 'DIVERSIÓN', anime: 'ANIME', sticker: 'STICKERS', tools: 'HERRAMIENTAS',
    nsfw: 'NSFW', audio: 'AUDIO', prem: 'PREMIUM', otros: 'OTROS'
  }

  let fecha = new Date().toLocaleDateString('es-PE', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Lima'})
  let hora = new Date().toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima'})

  let menu = `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ 🍕

.⃟𖥔 ݁. 𖦹˙— \`\`MENÚ PRINCIPAL\`\` —˙𖦹.🍕꒷

── *👤 PERFIL* ╏
👤 ➛ Usuario: @${taguser.split('@')[0]}
👑 ➛ Owner: ${ownerTag}
📱 ➛ Bot: +${numBot}

── *📊 ESTADÍSTICAS* ╏
⚡ ➛ Ping: ${ping}ms
⏱️ ➛ Actividad: ${_uptime}
👥 ➛ Usuarios: ${totalreg}
📜 ➛ Comandos: ${totalcmd}

── *💻 SISTEMA* ╏
💾 ➛ RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)}gb
📅 ➛ ${fecha}
🕐 ➛ ${hora}

── *📖 LISTA DE COMANDOS* ╏
`

  for (let category in groups) {
    let icon = icons[category] || '📁'
    let catName = categoryNames[category] || category.toUpperCase()
    menu += `\n.⃟𖥔 ݁. 𖦹˙— \`\`${catName}\`\` —˙𖦹.${icon}꒷\n`
    for (let cmd of groups[category]) {
      menu += `│ ${icon} ${usedPrefix}${cmd}\n`
    }
  }

  menu += `
── *📝 AYUDA* ╏
💡 ➛ Usa ${usedPrefix} antes de cada comando
💡 ➛ Ejemplo: ${usedPrefix}menu
> _"Mejorando como lasaña"_ 😼

━━━━━━━━━━━`

  await conn.sendMessage(m.chat, {
    image: img,
    caption: menu,
    mentions: [taguser, owner]
  }, { quoted: m })

  await react('✅')
}

handler.help = ['menu', 'help', 'menú']
handler.tags = ['info']
handler.command = /^(menu|help|menú)$/i

export default handler

function clockString(ms) {
  let h = isNaN(ms)? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms)? '--' : Math.floor(ms / 60000) % 60
  return [h, m].map(v => v.toString().padStart(2, 0)).join('h ') + 'm'
}