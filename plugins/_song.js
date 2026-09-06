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

async function downloadMp3(youtubeUrl) {
    const res = await fetch(`${SVETY_API}?url=${encodeURIComponent(youtubeUrl)}`)
    const json = await res.json()
    if(!json?.data?.url) throw 'No se pudo descargar el MP3. Svety falló'
    return json.data.url
}

const handler = async (m, { conn }) => {
    await m.react('📝')
    try {
        const song = await detectSongFromMessage(m, conn)
        await m.react('🔍')
        const search = await yts(`${song.title} ${song.artist}`)
        const video = search.videos[0]
        if(!video) throw 'No encontré el video en YouTube'

        await m.react('⬇️')
        const mp3Url = await downloadMp3(video.url)

        await m.react('📄')
        const lyricsRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`).then(r => r.json())
        let lyrics = lyricsRes.lyrics || 'No encontré la letra. Jon la perdió'
        if(lyrics.length > 1200) lyrics = lyrics.slice(0, 1200) + '\n\n...Muy larga, prefiero dormir 😴'

        await m.react('✅')

        // 1. Enviar letra
        await conn.sendMessage(m.chat, {
            text: `🐱 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🐱

.⃟𖥔 ݁. 𖦹˙— \`\`𝐋𝐞𝐭𝐫𝐚 + 𝐋𝐚𝐬𝐚𝐧𝐚\`\` —˙𖦹.💭꒷

📌 *${song.title}* - *${song.artist}*
💿 *${song.album || 'Album desconocido'}*

\`\`${lyrics}\`\`

━━━━━━━━━━━
> *"Si hay lasaña, canto"* 🍝
━━━━━━━━━━━`
        }, { quoted: m })

        // 2. Enviar MP3 como DOCUMENTO para que si se pueda descargar
        await conn.sendMessage(m.chat, {
            document: { url: mp3Url },
            mimetype: 'audio/mpeg',
            fileName: `${song.title} - ${song.artist}.mp3`,
            caption: `😼 Aquí tienes tu lasaña musical\n> Si no reproduce, descárgalo`
        }, { quoted: m })

        // 3. Opcional: También mandarlo como nota de voz
        // await conn.sendMessage(m.chat, { audio: { url: mp3Url }, mimetype: 'audio/mpeg', ptt: true }, { quoted: m })

    } catch(e) {
        await m.react('❌')
        m.reply(`🐱 *Error:* ${e.message}\n> Dame lasaña y lo intento de nuevo 🍝`)
    }
}

handler.help = ['letra']
handler.tags = ['buscador']
handler.command = ['letra']
export default handler