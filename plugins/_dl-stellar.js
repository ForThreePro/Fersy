import ytsearch from "yt-search"
import fetch from "node-fetch"

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

const getBuffer = async (url) => {
    const res = await fetch(url)
    return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn, text, command }) => {
    if (!text) return m.reply(`《✧》 Falta link\n
*.play1* nombre de la canción
*.tomp3* link de tiktok
*.ig* link de instagram`)

    await m.react('⏳')
    try {

        // ======================================
        //.play1
        // ======================================
        if (command === 'play1') {
            const searchResult = await ytsearch(text)
            if (!searchResult.videos ||!searchResult.videos.length) throw 'No se encontró la canción.'
            const video = searchResult.videos[0]
            const { title, author, timestamp: duration, views, url, image } = video
            const thumbBuffer = await getBuffer(image)
            await conn.sendMessage(m.chat, { image: thumbBuffer, caption: `_\`୨୧ YT\` ───── *${title}*_\n\n_── ִ ۟ *¡Enviando audio!*_` }, { quoted: m })
            const resDl = await fetch(`${api.url}/dl/ytmp3?url=${encodeURIComponent(url)}&key=${api.key}`).then(r => r.json())
            const dl = resDl?.data?.dl || resDl?.data?.download
            const audioBuffer = await getBuffer(dl)
            await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m })
        }

        // ======================================
        //.tomp3
        // ======================================
        if (command === 'tomp3') {
            const res = await fetch(`${api.url}/dl/tiktokmp3?url=${encodeURIComponent(text)}&key=${api.key}`).then(r => r.json())
            const data = res?.data || res
            const dl = data?.download || data?.dl
            const title = data?.title || 'tiktok'
            const audioBuffer = await getBuffer(dl)
            await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m })
        }

        // ======================================
        //.ig - INSTAGRAM FIX
        // ======================================
        if (command === 'ig') {
            const apiUrl = `${api.url}/dl/instagram?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl).then(r => r.json())

            console.log("RESPUESTA IG:", JSON.stringify(res, null, 2)) // Revisa consola

            const data = res?.data || res?.result || res
            const dl = data?.download || data?.dl || data?.url || data?.video || data?.media

            if (!dl) {
                await m.react('❌')
                return m.reply("《✧》 No se pudo descargar. El link es privado, de historia o la API falló")
            }

            const mediaBuffer = await getBuffer(dl)
            const caption = data?.title || data?.caption || data?.description || 'Instagram'

            await conn.sendMessage(m.chat, {
                video: mediaBuffer,
                caption: `_\`୨୧ Instagram\`_\n\n_${caption}_\n\n_${text}_`,
                mimetype: 'video/mp4'
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        console.log("ERROR:", e)
        await m.reply(`《✧》 Error: ${e.message || e}`)
    }
}

handler.help = ['play1 <nombre>', 'tomp3 <link>', 'ig <link>']
handler.tags = ['downloader']
handler.command = /^(play1|tomp3|ig)$/i

export default handler