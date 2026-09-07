import ytsearch from "yt-search"
import fetch from "node-fetch"

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

const getBuffer = async (url) => {
    try {
        const res = await fetch(url)
        return Buffer.from(await res.arrayBuffer())
    } catch(e) {
        throw 'Error descargando el archivo'
    }
}

let handler = async (m, { conn, text, command }) => {
    if (!text) return m.reply(`《✧》 Falta texto o link

*.play1* nombre de la canción
*.tomp3* link de tiktok`)

    await m.react('⏳')
    try {

        // ======================================
        //.play1 - YOUTUBE MP3
        // ======================================
        if (command === 'play1') {
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

            const caption = `_\`୨୧ YT Download\` ───── *${title}*_

> _✐ \`Canal\` ── ${canal}_
> _ⴵ \`Duración\` ── ${duration || '0:00'}_
> _✰ \`Vistas\` ── ${vistas}_
> _🜸 \`Enlace\` ── ${url}_

> _── ִ ۟ *¡Enviando audio!*_`

            await conn.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })

            const dlEndpoint = `${api.url}/dl/ytmp3?url=${encodeURIComponent(url)}&key=${api.key}`
            const resDl = await fetch(dlEndpoint).then(r => r.json())
            const dl = resDl?.data?.dl || resDl?.data?.download

            if (!dl) throw 'No se pudo descargar el audio de YT'
            const audioBuffer = await getBuffer(dl)

            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                ptt: false
            }, { quoted: m })
        }

        // ======================================
        //.tomp3 - TIKTOK MP3
        // ======================================
        if (command === 'tomp3') {
            const apiUrl = `${api.url}/dl/tiktokmp3?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl).then(r => r.json())
            const data = res?.data || res

            const dl = data?.download || data?.dl
            const title = data?.title || 'tiktok'
            const author = data?.author || 'Desconocido'
            const thumb = data?.thumbnail

            if (!dl) throw 'No se pudo descargar. Link mal o privado'

            const audioBuffer = await getBuffer(dl)
            const caption = `_\`୨୧ TikTok MP3\` ───── *${title}*_

> _👤 \`Autor\` ── ${author}_
> _🜸 \`Link\` ── ${text}_

> _── ִ ۟ *¡Enviando audio!*_`

            if (thumb) {
                const thumbBuffer = await getBuffer(thumb)
                await conn.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })
            } else {
                await m.reply(caption)
            }

            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                ptt: false
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        console.log("ERROR:", e)
        await m.reply(`《✧》 Error: ${e}`)
    }
}

handler.help = ['play1 <nombre>', 'tomp3 <link>']
handler.tags = ['descargas']
handler.command = /^(play1|tomp3)$/i

export default handler