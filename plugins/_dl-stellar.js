import ytsearch from "yt-search"
import fetch from "node-fetch"

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

const getBuffer = async (url) => {
    const res = await fetch(url)
    return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn, text, command }) => {
    if (!text) return m.reply(`《✧》 Falta texto o link\n
*.play1* nombre de la canción
*.tomp3* link de tiktok`)

    await m.react('⏳')
    try {

        // ======================================
        // COMANDO.play1
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
> _ⴵ \`Duración\` ── ${duration || ''}_
> _✰ \`Vistas\` ── ${vistas}_
> _🜸 \`Enlace\` ── ${url}_

> _── ִ ۟ *¡Enviando audio!*_`

            await conn.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })

            const dlEndpoint = `${api.url}/dl/ytmp3?url=${encodeURIComponent(url)}&key=${api.key}`
            const resDl = await fetch(dlEndpoint).then(r => r.json())

            const dl = resDl?.data?.dl || resDl?.data?.download || resDl?.download
            if (!dl) throw 'No se pudo descargar el audio'

            const audioBuffer = await getBuffer(dl)

            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                ptt: false
            }, { quoted: m })
        }

        // ======================================
        // COMANDO.tomp3
        // ======================================
        if (command === 'tomp3') {
            const apiUrl = `${api.url}/dl/tiktokmp3?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl).then(r => r.json())

            console.log("RESPUESTA TIKTOK:", JSON.stringify(res, null, 2)) // Ver en consola

            const data = res?.data || res?.result || res
            const dl = data?.download || data?.dl || data?.url || data?.link
            const title = data?.title || data?.name || 'tiktok'
            const author = data?.author || data?.username || 'Desconocido'
            const thumb = data?.thumbnail || data?.image || data?.cover

            if (!dl) {
                await m.react('❌')
                return m.reply("《✧》 No se pudo descargar. El link es privado o la API falló")
            }

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
        await m.reply(`《✧》 Error: ${e.message}`)
    }
}

handler.help = ['play1 <nombre>', 'tomp3 <link>']
handler.tags = ['downloader']
handler.command = /^(play1|tomp3)$/i

export default handler