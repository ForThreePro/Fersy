import axios from 'axios'

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`Usa: *.play1 nombre de la canción*\nEjemplo: .play1 rauw alejandro punto 40`)

    await m.react('⏳')
    try {
        // PASO 1: BUSCAR Y DESCARGAR
        const res = await axios.get(`${api.url}/download/play?text=${encodeURIComponent(text)}&key=${api.key}`, { timeout: 60000 })
        const data = res.data
        
        if (!data || !data.dl_audio) throw 'No se encontró la canción'

        let caption = `*${data.title}*\n`
            + `👤 Artista: ${data.author}\n`
            + `⏱️ Duración: ${data.duration}\n`
            + `👀 Vistas: ${data.views}\n\n`
            + `Descargando audio...`

        // PASO 2: MANDAR CARATULA + INFO
        await conn.sendMessage(m.chat, {
            image: { url: data.image },
            caption: caption
        }, { quoted: m })

        // PASO 3: MANDAR AUDIO
        await conn.sendMessage(m.chat, {
            audio: { url: data.dl_audio },
            mimetype: 'audio/mpeg',
            fileName: `${data.title}.mp3`,
            ptt: false
        }, { quoted: m })

        // PASO 4: MANDAR DOCUMENTO AUTOMATICO
        await conn.sendMessage(m.chat, {
            document: { url: data.dl_audio },
            mimetype: 'audio/mpeg',
            fileName: `${data.title}.mp3`,
            caption: `Documento MP3 - ${data.title}`
        }, { quoted: m })

        await m.react('✅')

    } catch (err) {
        await m.react('❌')
        m.reply(`Error: ${err.message || err}\n\nIntenta con otro nombre`)
    }
}

handler.help = ['play1 <nombre> - Busca y descarga música en MP3 + Documento']
handler.tags = ['descargas']
handler.command = /^(play1)$/i
export default handler