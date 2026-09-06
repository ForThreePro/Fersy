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
const SONGFINDER_SEARCH = 'https://songfinder.gg/api/search?q='
const UGUU_UPLOAD = 'https://uguu.se/upload'
const CLIP_SECONDS = 30

// ===== FUNCIONES BASE =====
async function recognizeUrl(audioUrl) {
  const res = await fetch(SONGFINDER_API, {
    method: 'POST',
    headers: {'content-type': 'application/json', 'origin': 'https://songfinder.gg'},
    body: JSON.stringify({ url: audioUrl, startTime: 0, recaptchaToken: crypto.randomBytes(24).toString('base64url') })
  })
  const json = await res.json()
  if (!json?.success ||!json?.track) throw new Error('No encontré nada. Estaba durmiendo zZz')
  return json.track
}

async function uploadUguu(buffer) {
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || { ext: 'mp3', mime: 'audio/mpeg' }
  const blob = new Blob([buffer], { type: mime })
  const form = new FormData()
  form.append('files[]', blob, crypto.randomBytes(5).toString('hex') + '.' + ext)
  const res = await fetch(UGUU_UPLOAD, { method: 'POST', body: form })
  const data = await res.json()
  return data?.files?.[0]?.url
}

function prepareClip(buffer, seconds = CLIP_SECONDS) {
  return new Promise(resolve => {
    const tmpIn = path.join(os.tmpdir(), `sf_${Date.now()}`)
    fs.writeFileSync(tmpIn, buffer)
    const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', tmpIn, '-t', String(seconds), '-vn', '-acodec', 'libmp3lame', '-ar', '44100', '-ac', '2', '-b:a', '128k', '-f', 'mp3', 'pipe:1'])
    const chunks = []
    ff.stdout.on('data', c => chunks.push(c))
    ff.on('close', () => {
        try{fs.unlinkSync(tmpIn)}catch{}
        resolve(chunks.length? Buffer.concat(chunks) : buffer)
    })
  })
}

async function detectSongFromMessage(m, conn) {
    let q = m.quoted? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime ||!/audio|video/.test(mime)) throw 'Responde a un audio o video. No me hagas trabajar sin café ☕'
    let buffer = await q.download()
    if (!buffer) throw 'Error al descargar. Tengo hambre'
    let clip = await prepareClip(buffer, CLIP_SECONDS)
    let url = await uploadUguu(clip)
    return await recognizeUrl(url)
}

function formatDuration(seconds) {
    return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`
}

// ===== 1. COMANDO.info =====
const info = async (m, { conn }) => {
    await m.react('🔍')
    try {
        const song = await detectSongFromMessage(m, conn)
        const search = await yts(`${song.title} ${song.artist}`)
        const thumb = search.videos[0]?.thumbnail || ''

        await m.react('✅')
        await conn.sendMessage(m.chat, {
            image: { url: thumb },
            caption: `🐱 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🐱

.⃟𖥔 ݁. 𖦹˙— \`\`𝐋𝐚𝐬𝐚𝐧𝐚 𝐈𝐧𝐟𝐨\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗜𝗡𝗙𝗢 𝗗𝗘 𝗟𝗔 𝗖𝗔𝗡𝗖𝗜𝗢𝗡 ：✿ 。

📌 ➛ Titulo: *${song.title}*
👤 ➛ Artista: *${song.artist}*
💿 ➛ Album: *${song.album || 'No sé, estaba dormido'}*
📅 ➛ Lanzamiento: *${song.release_date || 'Hace mucho'}*
⏱️ ➛ Duracion: *${formatDuration(song.duration)}*

  ꒱ ׁ. ᘏ 𝗟𝗜𝗡𝗞𝗦 ׅ 𝆬 ָ֢ ෆ
🟢 Spotify: ${song.spotify || 'N/A'}
🔴 YouTube: ${song.youtube || 'N/A'}
🍎 Apple: ${song.apple_music || 'N/A'}

━━━━━━━━━━━
> *"Odio los lunes, pero amo la música"* ☕🎵
━━━━━━━━━━━`
        }, { quoted: m })
    } catch(e) {
        await m.react('❌')
        m.reply(`🐱 *Error:* ${e.message}\n> Dame lasaña y lo intento de nuevo 🍝`)
    }
}

// ===== 2. COMANDO.letra =====
const letra = async (m, { conn }) => {
    await m.react('📝')
    try {
        const song = await detectSongFromMessage(m, conn)
        const search = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`).then(r => r.json())

        if(!search.lyrics) throw 'No hay letra. Jon no me la pasó'

        let lyrics = search.lyrics
        if(lyrics.length > 1200) lyrics = lyrics.slice(0, 1200) + '\n\n...Muy larga para leer, prefiero dormir 😴'

        await m.react('✅')
        m.reply(`🐱 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🐱

.⃟𖥔 ݁. 𖦹˙— \`\`𝐋𝐞𝐭𝐫𝐚 𝐜𝐨𝐧 𝐋𝐚𝐬𝐚𝐧𝐚\`\` —˙𖦹.💭꒷

📌 *${song.title}* - *${song.artist}*

\`\`\`${lyrics}\`\`\`

━━━━━━━━━━━
> *"Cantar cansa. Mejor como"* 😼
━━━━━━━━━━━`)
    } catch(e) {
        await m.react('❌')
        m.reply(`🐱 *Error:* ${e.message}`)
    }
}

// ===== 3. COMANDO.similar =====
const similar = async (m, { conn }) => {
    await m.react('🔍')
    try {
        const song = await detectSongFromMessage(m, conn)
        const search = await yts(`${song.artist} ${song.title} similar`)

        let text = `🐱 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🐱

.⃟𖥔 ݁. 𖦹˙— \`\`𝐑𝐞𝐜𝐨𝐦𝐞𝐧𝐝𝐚𝐜𝐢𝐨𝐧𝐞𝐬\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗦𝗜𝗠𝗜𝗟𝗔𝗥 𝗔: *${song.title}*

`
        search.videos.slice(0,5).forEach((v,i) => {
            text += `*${i+1}.* *${v.title}*\n`
            text += ` 👤 ${v.author.name}\n`
            text += ` ⏱️ ${v.timestamp}\n`
            text += ` 🔗 ${v.url}\n\n`
        })

        text += `━━━━━━━━━━━
> *"Si suena bien, la pongo mientras como"* 🍝`

        await m.react('✅')
        m.reply(text, { quoted: m })
    } catch(e) {
        await m.react('❌')
        m.reply(`🐱 *Error:* ${e.message}`)
    }
}

// ===== 4. COMANDO.buscar =====
const buscar = async (m, { conn, text }) => {
    if(!text) return m.reply('🐱 *Usa:*.buscar nombre de cancion\n> No adivino, no soy psíquico')
    await m.react('🔍')
    try {
        const res = await fetch(SONGFINDER_SEARCH + encodeURIComponent(text)).then(r => r.json())
        if(!res.results || res.results.length === 0) throw 'No encontré nada. Odio eso'

        let reply = `🐱 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🐱\n\n.⃟𖥔 ݁. Busqueda: *${text}*\n\n`
        res.results.slice(0,5).forEach((s,i) => {
            reply += `*${i+1}.* *${s.title}* - ${s.artist}\n`
        })
        reply += `\n> *"5 resultados es suficiente. Más es trabajar"*`
        await m.react('✅')
        m.reply(reply)
    } catch(e) {
        await m.react('❌')
        m.reply(`🐱 *Error:* ${e.message}`)
    }
}

// ===== EXPORTAR PARA TU BOT =====
const handler = async (m, { conn, command, text }) => {
    if(command === 'info') return info(m, { conn })
    if(command === 'letra') return letra(m, { conn })
    if(command === 'similar') return similar(m, { conn })
    if(command === 'buscar') return buscar(m, { conn, text })
}

handler.help = ['info', 'letra', 'similar', 'buscar']
handler.tags = ['buscador']
handler.command = ['info', 'letra', 'similar', 'buscar']
export default handler