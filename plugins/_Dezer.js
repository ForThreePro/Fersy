import fetch from "node-fetch"
import yts from 'yt-search'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import { spawn } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

const SONGFINDER_API = 'https://songfinder.gg/api/recognize/url'
const UGUU_UPLOAD = 'https://uguu.se/upload'
const CLIP_SECONDS = 30

const handler = async (m, { conn }) => {
    try {
        let q = m.quoted? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        
        if (!mime || !/audio|video/.test(mime)) return m.reply(`🐉 𓆩 𝗦𝗢𝗡 𝗚𝗢𝗞𝗨 𝗣𝗥𝗘𝗠 𓆪 🐉

.⃟𖥔 ݁. 𖦹˙— \`\`𝐏𝐫𝐞𝐦\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗕𝗨𝗦𝗖𝗔𝗗𝗢𝗥 𝗗𝗘 𝗠𝗨𝗦𝗜𝗖𝗔 ：✿ 。

──愛 *COMO USAR* ╏ ❄️
💭 ➛ Responde a un audio o video con: .song
💭 ➛ Ejemplo: Responde a un estado de WhatsApp

━━━━━━━━━━━
*Owner*: @whois.yallico | *Numero*: +51 927 174 369
━━━━━━━━━━━`)

        await m.react('🔍')
        let buffer = await q.download()
        if (!buffer) throw 'Error al descargar'

        // 1. DETECTAR CANCION
        await m.reply(`🐉 𓆩 𝗦𝗢𝗡 𝗚𝗢𝗞𝗨 𝗣𝗥𝗘𝗠 𓆪 🐉

.⃟𖥔 ݁. 𖦹˙— \`\`𝐏𝐫𝐞𝐦\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗗𝗘𝗧𝗘𝗖𝗧𝗔𝗡𝗗𝗢 𝗖𝗔𝗡𝗖𝗜𝗢𝗡 ：✿ 。
꒰ ◞⁺⊹ ．Shazam Saiyan •

  ꒱ ׁ. ᘏ 𝗣𝗥𝗢𝗖𝗘𝗦𝗢 ׅ 𝆬 ָ֢ ෆ
💭 ➛ Analizando ${CLIP_SECONDS}s de audio...
💭 ➛ Extrayendo energia del sonido ⚡

━━━━━━━━━━━`)

        let clip = await prepareClip(buffer, CLIP_SECONDS)
        let url = await uploadUguu(clip)
        let song = await recognizeUrl(url)
        let searchQuery = `${song.title} ${song.artist}`.replace(/\[.*?\]|\(feat.*?\)/gi, '').trim()

        // 2. BUSCAR Y DESCARGAR
        await m.react('📥')
        let search = await yts(searchQuery)
        let result = search.videos[0]
        if (!result) throw 'No se encontró la canción en YouTube'

        const { title, thumbnail, timestamp, views, videoId, author } = result
        const shortUrl = `https://youtu.be/${videoId}`
        const thumb = (await conn.getFile(thumbnail)).data
        const vistas = formatViews(views)

        // Enviar info
        await conn.sendMessage(m.chat, {
            image: thumb,
            caption: `🐉 𓆩 𝗦𝗢𝗡 𝗚𝗢𝗞𝗨 𝗣𝗥𝗘𝗠 𓆪 🐉

.⃟𖥔 ݁. 𖦹˙— \`\`𝐏𝐫𝐞𝐦\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗖𝗔𝗡𝗖𝗜𝗢𝗡 𝗘𝗡𝗖𝗢𝗡𝗧𝗥𝗔𝗗𝗔 ：✿ 。
꒰ ◞⁺⊹ ．Descarga completa •

  ꒱ ׁ. ᘏ 𝗗𝗘𝗧𝗔𝗟𝗘𝗦 ׅ 𝆬 ָ֢ ෆ
📌 ➛ Titulo: *${title}*
👤 ➛ Artista: *${author.name}*
👁️ ➛ Vistas: *${vistas}*
⏱️ ➛ Duracion: *${timestamp}*
🔗 ➛ Link: ${shortUrl}

━━━━━━━━━━━
*Owner*: @whois.yallico | *Numero*: +51 927 174 369
> *Descargando con energia Saiyan* ⚡
━━━━━━━━━━━`
        }, { quoted: m })

        // 3. DESCARGAR AUDIO
        const mediaUrl = await getMediaUrl(shortUrl)
        if (!mediaUrl) throw 'No se pudo obtener el audio.'

        await conn.sendMessage(m.chat, {
            audio: { url: mediaUrl },
            fileName: `${title}.mp3`,
            mimetype: 'audio/mpeg'
        }, { quoted: m })

        await m.react('✅')

    } catch(e) {
        await m.react('❌')
        m.reply(`🐉 𓆩 𝗦𝗢𝗡 𝗚𝗢𝗞𝗨 𝗣𝗥𝗘𝗠 𓆪 🐉

.⃟𖥔 ݁. 𖦹˙— \`\`𝐏𝐫𝐞𝐦\`\` —˙𖦹.⚠️꒷

 ⤷ ┇ 𝗘𝗥𝗢𝗥 𝗗𝗘 𝗦𝗜𝗦𝗧𝗘𝗠𝗔 ：✿ 。

──愛 *FALLA* ╏ ❄️
⚠️ ➛ ${e.message}
⚠️ ➛ Intenta con un audio/video mas claro

━━━━━━━━━━━`)
    }
}

// ===== FUNCIONES =====
async function recognizeUrl(audioUrl) {
  const res = await fetch(SONGFINDER_API, {
    method: 'POST',
    headers: {'content-type': 'application/json', 'origin': 'https://songfinder.gg'},
    body: JSON.stringify({ url: audioUrl, startTime: 0, recaptchaToken: crypto.randomBytes(24).toString('base64url') })
  })
  const json = await res.json()
  if (!json?.success ||!json?.track) throw new Error('No se encontró la canción')
  return json.track
}

async function uploadUguu(buffer) {
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || { ext: 'mp3', mime: 'audio/mpeg' }
  const blob = new Blob([buffer], { type: mime })
  const form = new FormData()
  form.append('files[]', blob, crypto.randomBytes(5).toString('hex') + '.' + ext)
  const res = await fetch(UGUU_UPLOAD, { method: 'POST', body: form })
  return (await res.json())?.files?.[0]?.url
}

function prepareClip(buffer, seconds = CLIP_SECONDS) {
  return new Promise(resolve => {
    const tmpIn = path.join(os.tmpdir(), `sf_${Date.now()}`)
    fs.writeFileSync(tmpIn, buffer)
    const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', tmpIn, '-t', String(seconds), '-vn', '-acodec', 'libmp3lame', '-ar', '44100', '-ac', '2', '-b:a', '128k', '-f', 'mp3', 'pipe:1'])
    const chunks = []
    ff.stdout.on('data', c => chunks.push(c))
    ff.on('close', () => { try{fs.unlinkSync(tmpIn)}catch{}; resolve(chunks.length? Buffer.concat(chunks) : buffer) })
  })
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

handler.help = ['song']
handler.tags = ['buscador']
handler.command = ['song']
export default handler