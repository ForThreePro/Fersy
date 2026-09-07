import axios from 'axios'

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`Usa: *.play1 nombre de la canción*\nEjemplo: .play1 new york peso pluma`)

    await m.react('⏳')
    try {
        // ESTA RUTA BUSCA Y DESCARGA DIRECTO
        const res = await axios.get(`${api.url}/dl/youtubeplay?query=${encodeURIComponent(text)}&key=${api.key}`, { timeout: 120000 })
        const data = res.data?.data || res.data?.result
        
        if (!data || !data.download) throw 'No se encontró la canción o el link expiró'

        let caption = `*${data.title || text}*\n`
            + `👤 Artista: ${data.author || 'Desconocido'}\n`
            + `⏱️ Duración: ${data.duration || '-'}\n`
            + `👀 Vistas: ${data.views || '-'}`

        // PASO 1: MANDAR CARATULA
        if (data.thumbnail) {
            await conn.sendMessage(m.chat, {
                image: { url: data.thumbnail },
                caption: caption
            }, { quoted: m })
        } else {
            await m.reply(caption)
        }

        // PASO 2: MANDAR AUDIO
        await conn.sendMessage(m.chat, {
            audio: { url: data.download },
            mimetype: 'audio/mpeg',
            fileName: `${data.title || text}.mp3`,
            ptt: false
        }, { quoted: m })

        // PASO 3: MANDAR DOCUMENTO AUTOMATICO
        await conn.sendMessage(m.chat, {
            document: { url: data.download },
            mimetype: 'audio/mpeg',
            fileName: `${data.title || text}.mp3`,
            caption: `Documento MP3 - ${data.title || text}`
        }, { quoted: m })

        await m.react('✅')

    } catch (err) {
        await m.react('❌')
        console.log(err.response?.data)
        m.reply(`Error: ${err.response?.data?.message || err.message}\n\nIntenta con un nombre más corto`)
    }
}

handler.help = ['play1 <nombre> - Busca y descarga música MP3 + Documento']
handler.tags = ['downloader', 'music']
handler.command = /^(play1)$/i
export default handler