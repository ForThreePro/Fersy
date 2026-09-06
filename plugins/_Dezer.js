import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import { spawn } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import yts from 'yt-search'

/* ====== CONFIG ====== */
const STELLAR_KEY = 'api-b6GCD' // ⚠️ Cambia esta key
const SONGFINDER_API = 'https://songfinder.gg/api/recognize/url'
const UGUU_UPLOAD = 'https://uguu.se/upload'
const CLIP_SECONDS = 30

/* ====== SONGFINDER ====== */
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

/* ====== STELLAR YTDL ====== */
async function searchYT(query) {
  let res = await yts(query)
  let vid = res.videos[0]
  if (!vid) throw new Error('No se encontró en YouTube')
  return vid
}

async function downloadStellar(url) {
  let apiUrl = `https://api.stellarwa.xyz/dl/ytmp3?url=${encodeURIComponent(url)}&key=${STELLAR_KEY}`
  let res = await fetch(apiUrl)
  let json = await res.json()

  if (!json.status) throw new Error(json.message || 'Error al descargar con Stellar')

  return {
    downloadUrl: json.result.dl,
    title: json.result.title,
    thumb: json.result.thumb
  }
}

/* ====== HANDLER.SONG ====== */
let handler = async (m, { conn }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime ||!/audio|video/.test(mime)) return m.reply(`🐉 𓆩 𝗦𝗢𝗡 𝗚𝗢𝗞𝗨 𝗣𝗥𝗘𝗠 𓆪 🐉

.⃟𖥔 ݁. 𖦹˙— \`\`𝐏𝐫𝐞𝐦\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗕𝗨𝗦𝗖𝗔𝗗𝗢𝗥 𝗗𝗘 𝗠𝗨𝗦𝗜𝗖𝗔 ：✿ 。

──愛 *COMO USAR* ╏ ❄️
💭 ➛ Responde a un audio o video con:.song
💭 ➛ Ejemplo: Responde a un estado de WhatsApp

━━━━━━━━━━━
*Owner*: @whois.yallico | *Numero*: +51 927 174 369
━━━━━━━━━━━`)

  await m.react('🔍')
  let buffer = await q.download()
  if (!buffer) return m.reply('❌ Error al descargar')

  try {
    // 1. DETECTAR
    await m.reply(`🐉 𓆩 𝗦𝗢𝗡 𝗚𝗢𝗞𝗨 𝗣𝗥𝗘𝗠 𓆪 🐉

.⃟𖥔 ݁. 𖦹˙— \`\`𝐏𝐫𝐞𝐦\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗗𝗘𝗧𝗘𝗖𝗧𝗔𝗡𝗗𝗢 𝗖𝗔𝗡𝗖𝗜𝗢𝗡 ：✿ 。
꒰ ◞⁺⊹ ．Shazam Saiyan •

  ꒱ ׁ. ᘏ 𝗣𝗥𝗢𝗖𝗘𝗦𝗢 ׅ 𝆬 ָ֢ ෆ
💭 ➛ Analizando ${CLIP_SECONDS}s de audio...
💭 ➛ Extrayendo energia del sonido ⚡

━━━━━━━━━━━
*Owner*: @whois.yallico | *Numero*: +51 927 174 369
> *Esperando resultado...*
━━━━━━━━━━━`)

    let clip = await prepareClip(buffer, CLIP_SECONDS)
    let url = await uploadUguu(clip)
    let song = await recognizeUrl(url)
    let searchQuery = `${song.title} ${song.artist}`.replace(/\[.*?\]|\(feat.*?\)/gi, '').trim()

    // 2. BUSCAR Y DESCARGAR CON STELLAR
    await m.react('📥')
    let vid = await searchYT(searchQuery)
    let audio = await downloadStellar(vid.url)
    let audioBuffer = await (await fetch(audio.downloadUrl)).buffer()

    // 3. ENVIAR 1 SOLO MENSAJE + AUDIO
    let texto = `🐉 𓆩 𝗦𝗢𝗡 𝗚𝗢𝗞𝗨 𝗣𝗥𝗘𝗠 𓆪 🐉

.⃟𖥔 ݁. 𖦹˙— \`\`𝐏𝐫𝐞𝐦\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗖𝗔𝗡𝗖𝗜𝗢𝗡 𝗘𝗡𝗖𝗢𝗡𝗧𝗥𝗔𝗗𝗔 ：✿ 。
꒰ ◞⁺⊹ ．Descarga completa •

  ꒱ ׁ. ᘏ 𝗗𝗘𝗧𝗔𝗟𝗘𝗦 ׅ 𝆬 ָ֢ ෆ
💭 ➛ Titulo: *${audio.title}*
💭 ➛ Artista: *${song.artist}*
💭 ➛ Duracion: *${vid.timestamp}*
💭 ➛ Estado: *Enviando audio* ✅

━━━━━━━━━━━
*Owner*: @whois.yallico | *Numero*: +51 927 174 369
> *"La musica es el poder del alma"* 🎵
━━━━━━━━━━━`

    await conn.sendMessage(m.chat, { text: texto }, { quoted: m })

    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: `${audio.title}.mp3`
    }, { quoted: m })

    await m.react('✅')

  } catch(e) {
    await m.react('❌')
    m.reply(`🐉 𓆩 𝗦𝗢𝗡 𝗚𝗢𝗞𝗨 𝗣𝗥𝗘𝗠 𓆪 🐉

.⃟𖥔 ݁. 𖦹˙— \`\`𝐏𝐫𝐞𝐦\`\` —˙𖦹.⚠️꒷

 ⤷ ┇ 𝗘𝗥𝗢𝗥 𝗗𝗘 𝗦𝗜𝗦𝗧𝗘𝗠𝗔 ：✿ 。

──愛 *FALLA* ╏ ❄️
⚠️ ➛ ${e.message}
⚠️ ➛ Intenta con un audio mas claro

━━━━━━━━━━━
*Owner*: @whois.yallico | *Numero*: +51 927 174 369
━━━━━━━━━━━`)
  }
}

handler.help = ['song']
handler.tags = ['buscador']
handler.command = ['song']
export default handler