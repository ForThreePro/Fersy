import ytsearch from "yt-search"
import { getBuffer } from "#serialize"
import fetch from "node-fetch"

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

let handler = async (m, { conn, text, args }) => {
    if (!text) return m.reply("《✧》 Por favor, menciona el nombre de la canción\nEjemplo: *.play1 tusa*")

    await m.react('⏳')
    try {
        // 1. BUSCAR EN YT
        const searchResult = await ytsearch(text)
        if (!searchResult.videos ||!searchResult.videos.length) {
            await m.react('❌')
            return m.reply("《✧》 No se encontró la canción.")
        }

        const video = searchResult.videos[0]
        const { title, author, timestamp: duration, views, url, image } = video
        const vistas = (views || 0).toLocaleString()
        const canal = author?.name || author || "Desconocido"
        const thumbBuffer = await getBuffer(image)

        const caption = `_\`୨୧ Download\` ───── *${title}*_

> _✐ \`Canal\` ── ${canal}_
> _ⴵ \`Duración\` ── ${duration || ''}_
> _✰ \`Vistas\` ── ${vistas}_
> _🜸 \`Enlace\` ── ${url}_

> _── ִ ۟ *¡Enviando audio, por favor espera!*_`

        await conn.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })

        // 2. DESCARGAR CON STELLAR
        const dlEndpoint = `${api.url}/dl/ytmp3?url=${encodeURIComponent(url)}&key=${api.key}`
        const resDl = await fetch(dlEndpoint).then(r => r.json())

        if (!resDl?.data?.dl) {
            await m.react('❌')
            return m.reply("《✧》 No se pudo descargar el *audio*, la API falló.")
        }

        const audioBuffer = await getBuffer(resDl.data.dl)

        // 3. SOLO MANDAR AUDIO
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            ptt: false
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        console.log(e)
        await m.reply(`《✧》 Error: ${e.message}`)
    }
}

handler.help = ['play1 <nombre>']
handler.tags = ['downloader', 'music']
handler.command = /^(play1)$/i

export default handler