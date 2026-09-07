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
    if (!text) return m.reply(`《✧》 Falta texto o link\n*.play1* nombre de la canción\n*.ttmp3* link de tiktok`)

    await m.react('⏳')
    try {
        if (command === 'play1') {
            const searchResult = await ytsearch(text)
            if (!searchResult.videos ||!searchResult.videos.length) return m.reply("《✧》 No se encontró la canción.")
            const video = searchResult.videos[0]
            const { title, author, timestamp: duration, views, url, image } = video
            const vistas = (views || 0).toLocaleString()
            const canal = author?.name || author || "Desconocido"
            const thumbBuffer = await getBuffer(image)
            const caption = `_\`୨୧ YT Download\` ───── *${title}*_\n\n> _✐ \`Canal\` ── ${canal}_\n> _ⴵ \`Duración\` ── ${duration || '0:00'}_\n> _✰ \`Vistas\` ── ${vistas}_\n> _🜸 \`Enlace\` ── ${url}_\n\n> _── ִ ۟ *¡Enviando audio!*_`
            await conn.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })
            const dlEndpoint = `${api.url}/dl/ytmp3?url=${encodeURIComponent(url)}&key=${api.key}`
            const resDl = await fetch(dlEndpoint).then(r => r.json())
            const dl = resDl?.data?.dl || resDl?.data?.download
            if (!dl) throw 'No se pudo descargar el audio de YT'
            const audioBuffer = await getBuffer(dl)
            await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3`, ptt: false }, { quoted: m })
        }

        if (command === 'ttmp3' || command === 'tomp3' || command === 'tt') {
            const apiUrl = `${api.url}/dl/tiktokmp3?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl).then(r => r.json())
            const data = res?.data || res?.result || res
            let dl = data?.download || data?.dl || data?.music || data?.play
            const title = data?.title || data?.desc || 'tiktok'
            const author = data?.author?.nickname || data?.author || 'Desconocido'
            const thumb = data?.cover || data?.thumbnail
            if (!dl) throw 'No se pudo descargar. Link mal o privado'
            const audioBuffer = await getBuffer(dl)
            const caption = `_\`୨୧ TikTok MP3\` ───── *${title}*_\n\n> _👤 \`Autor\` ── ${author}_\n> _🜸 \`Link\` ── ${text}_\n\n> _── ִ ۟ *¡Enviando audio!*_`
            if (thumb) {
                const thumbBuffer = await getBuffer(thumb)
                await conn.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })
            } else {
                await m.reply(caption)
            }
            await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3`, ptt: false }, { quoted: m })
        }

        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        console.log("ERROR:", e)
        await m.reply(`《✧》 Error: ${e}`)
    }
}

handler.help = ['play1 <nombre>', 'ttmp3 <link>']
handler.tags = ['downloader']
handler.command = /^(play1|ttmp3|tomp3|tt)$/i
handler.register = true

export default handler