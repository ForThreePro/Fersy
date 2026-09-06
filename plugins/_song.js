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
const SVETY_API = 'https://api.sventy.store/api/ytdl'
const CLIP_SECONDS = 30

async function recognizeUrl(audioUrl) {
  const res = await fetch(SONGFINDER_API, {
    method: 'POST',
    headers: {'content-type': 'application/json', 'origin': 'https://songfinder.gg'},
    body: JSON.stringify({ url: audioUrl, startTime: 0, recaptchaToken: crypto.randomBytes(24).toString('base64url') })
  })
  const json = await res.json()
  if (!json?.success ||!json?.track) throw new Error('No encontré la canción. Estaba durmiendo zZz')
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

async function detectSongFromMessage(m, conn) {
    let q = m.quoted? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime ||!/audio|video/.test(mime)) throw 'Responde a un audio o video. No me hagas trabajar sin café ☕'
    let buffer = await q.download()
    if (!buffer) throw 'Error al descargar. Garfield tiene hambre'
    let clip = await prepareClip(buffer, CLIP_SECONDS)
    let url = await uploadUguu(clip)
    return await recognizeUrl(url)
}

async function getMediaUrl(url) {
    try {
        const res = await fetch(`${SVETY_API}?url=${encodeURIComponent(url)}`).then(r => r.json())
        return res.data?.url || res.data?.download || null
    } catch {
        return null
    }
}

// ===== COMANDO.letra =====
const handler = async (m, { conn }) => {
    try {
        let q = m.quoted? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        if (!mime ||!/audio|video/.test(mime)) return m.reply(`🐱 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🐱

.⃟𖥔 ݁. 𖦹˙— \`\`𝐋𝐚𝐬𝐚𝐧𝐚 𝐋𝐞𝐭𝐫𝐚\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗕𝗨𝗦𝗖𝗔𝗗𝗢𝗥 𝗗𝗘 𝗟𝗘𝗧𝗥𝗔 ：✿ 。
💭 ➛ Responde a un audio o video con:.letra
💭 ➛ Te doy la letra + MP3 para escuchar 😼

━━━━━━━━━━━`)

        await m.react('🔍')
        const song = await detectSongFromMessage(m, conn)
        const searchQuery = `${song.title} ${song.artist}`.replace(/\[.*?\]|\(feat.*?\)/gi, '').trim()

        await m.react('📝')
        let search = await yts(searchQuery)
        let result = search.videos[0]
        if (!result) throw 'No se encontró la canción en YouTube'

        const { title, author, videoId } = result
        const shortUrl = `https://youtu.be/${videoId}`

        // Buscar letra
        const lyricsRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`).then(r => r.json())
        let lyrics = lyricsRes.lyrics || 'No encontré la letra. Jon la perdió'
        if(lyrics.length > 1200) lyrics = lyrics.slice(0, 1200) + '\n\n...Muy larga, prefiero dormir 😴'

        await m.react('⬇️')
        const mediaUrl = await getMediaUrl(shortUrl)

        // Enviar letra
        await conn.sendMessage(m.chat, {
            text: `🐱 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🐱

.⃟𖥔 ݁. 𖦹˙— \`\`𝐋𝐚𝐬𝐚𝐧𝐚 𝐋𝐞𝐭𝐫𝐚\`\` —˙𖦹.💭꒷

📌 *${title}* - *${author.name}*

\`\`${lyrics}\`\`

━━━━━━━━━━━
> *"Cantar cansa. Mejor como"* 🍝
━━━━━━━━━━━`
        }, { quoted: m })

        // Enviar MP3 como AUDIO para escuchar
        if(mediaUrl){
            await conn.sendMessage(m.chat, {
                audio: { url: mediaUrl }, // <- AQUÍ ESTÁ EL CAMBIO
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                ptt: false // false = audio normal, true = nota de voz
            }, { quoted: m })
        }

        await m.react('✅')
    } catch(e) {
        await m.react('❌')
        m.reply(`🐱 Error: ${e.message}`)
    }
}

handler.help = ['letra']
handler.tags = ['buscador']
handler.command = ['letra']
export default handler