import axios from 'axios'

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`Usa: *.play1 nombre de la canción*\nEjemplo: .play1 shakira bzrp 53`)

    await m.react('⏳')
    try {
        // PASO 1: BUSCAR EN YT PARA SACAR EL LINK
        const search = await axios.get(`${api.url}/dl/ytsearch?query=${encodeURIComponent(text)}&key=${api.key}`, { timeout: 20000 })
        const video = search.data?.[0]
        if (!video) throw 'No se encontró la canción'
        
        // PASO 2: DESCARGAR MP3 CON EL LINK
        const dl = await axios.get(`${api.url}/dl/ytmp3?url=${encodeURIComponent(video.url)}&key=${api.key}`, { timeout: 120000 })
        const data = dl.data
        
        if (!data || !data.dl) throw 'No se pudo descargar'

        let caption = `*${video.title}*\n`
            + `👤 Canal: ${video.author}\n`
            + `⏱️ Duración: ${video.duration}\n`
            + `👀 Vistas: ${video.views}\n\n`
            + `Descargando audio...`

        // PASO 3: MANDAR CARATULA + INFO
        await conn.sendMessage(m.chat, {
            image: { url: video.thumbnail },
            caption: caption
        }, { quoted: m })

        // PASO 4: MANDAR AUDIO
        await conn.sendMessage(m.chat, {
            audio: { url: data.dl },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            ptt: false
        }, { quoted: m })

        // PASO 5: MANDAR DOCUMENTO AUTOMATICO
        await conn.sendMessage(m.chat, {
            document: { url: data.dl },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            caption: `Documento MP3 - ${video.title}`
        }, { quoted: m })

        await m.react('✅')

    } catch (err) {
        await m.react('❌')
        console.log(err)
        m.reply(`Error: ${err.response?.data?.message || err.message}\n\nPrueba con otro nombre`)
    }
}

handler.help = ['play1 <nombre> - Busca y descarga música en MP3']
handler.tags = ['downloader', 'music']
handler.command = /^(play1)$/i
export default handler