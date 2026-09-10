import fetch from "node-fetch"
import yts from 'yt-search'

// FUNCION PARA REACCIONES
const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text.trim()) {
            let menuUso = `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ 🎵

.⃟𖥔 ݁. 𖦹˙— \`\`DESCARGAS\`\` —˙𖦹.📥꒷

── *📝 DESCRIPCIÓN* ╏
🎵 ➛ Busca y descarga música de YouTube
🎵 ➛ Envía el audio en MP3

── *📖 USO* ╏
➛.*${command}* <nombre de canción>
➛.*${command}* <link de YouTube>

── *💡 EJEMPLOS* ╏
➛.*play* despacito
➛.*play* https://youtu.be/dQw4w9WgXcQ

── *⏱️ LÍMITE* ╏
📦 ➛ Máx duración: *30 minutos*

━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: menuUso }, { quoted: m })
        }

        await react(conn, m, '🔍')
        await m.reply(`𐔌 ꒱ ***.${command}*** 𐔌 ꒱ ⏳

.⃟𖥔 ݁. 𖦹˙— \`\`BUSCANDO\`\` —˙𖦹.🔍꒷

── *📊 ESTADO* ╏
🔍 ➛ Buscando canción...
📥 ➛ Obteniendo información...
⬇️ ➛ Preparando descarga...

━━━━━━━━━━━`)

        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)
        const result = videoMatch? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
        if (!result) throw new Error('No se encontraron resultados.')

        const { title, thumbnail, timestamp, views, videoId, author, seconds } = result
        if (seconds > 1800) throw new Error('El contenido supera el límite de duración de 30 minutos.')

        const vistas = formatViews(views)
        const canal = author.name
        const shortUrl = `https://youtu.be/${videoId}`

        const thumb = (await conn.getFile(thumbnail)).data

        const [_, mediaUrl] = await Promise.all([
            conn.sendMessage(m.chat, {
                image: thumb,
                caption: `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`ENCONTRADO\`\` —˙𖦹.🎵꒷

── *📊 INFORMACIÓN* ╏
📌 ➛ Título: *${title}*
👤 ➛ Canal: *${canal}*
👁️ ➛ Vistas: *${vistas}*
⏱️ ➛ Duración: *${timestamp}*
🔗 ➛ Link: ${shortUrl}

── *📥 DESCARGA* ╏
⬇️ ➛ Enviando audio...

━━━━━━━━━━━`
            }, { quoted: m }),
            getMediaUrl(shortUrl)
        ])

        if (!mediaUrl) throw new Error('No se pudo obtener el audio.')

        await react(conn, m, '📥')
        await conn.sendMessage(m.chat, {
            audio: { url: mediaUrl },
            fileName: `${title}.mp3`,
            mimetype: 'audio/mpeg'
        }, { quoted: m })

        await react(conn, m, '✅')

    } catch (e) {
        await react(conn, m, '❌')
        let menuErr = `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 DESCRIPCIÓN* ╏
❌ ➛ ${e.message}

── *💡 SOLUCIÓN* ╏
🔧 ➛ Usa un nombre o link válido
🔧 ➛ Máx 30 minutos de duración

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuErr }, { quoted: m })
    }
}

async function getMediaUrl(url) {
    try {
        const res = await fetch(`https://api.sventy.store/api/ytdl?url=${encodeURIComponent(url)}`).then(r => r.json())
        return res.data?.download || null
    } catch {
        return null
    }
}

function formatViews(views) {
    if (views === undefined) return "No disponible"
    if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k`
    return views.toString()
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'playaudio', 'ytaudio']
handler.tags = ['descargas']
handler.group = true
export default handler