import axios from 'axios'

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`Usa: *.play1 nombre de la canción*\nEjemplo: .play1 tusa`)

    await m.react('⏳')
    try {
        const res = await axios.get(`${api.url}/dl/youtubeplay?query=${encodeURIComponent(text)}&key=${api.key}`, { timeout: 120000 })
        
        console.log("RESPUESTA API:", JSON.stringify(res.data, null, 2)) // Para ver en consola qué devuelve
        
        const data = res.data || res.data.result || res.data
        
        if (!data) throw 'La API no devolvió datos'
        
        const dl = data.download || data.url || data.link
        const title = data.title || data.name || text
        const thumb = data.thumbnail || data.image || data.thumb
        const author = data.author || data.channel || 'Desconocido'

        if (!dl) throw 'No hay link de descarga en la respuesta'

        // PASO 1: CARATULA
        if (thumb) {
            await conn.sendMessage(m.chat, {
                image: { url: thumb },
                caption: `*${title}*\n👤 ${author}\n⏱️ ${data.duration || '-'}`
            }, { quoted: m })
        } else {
            await m.reply(`*${title}*\nDescargando...`)
        }

        // PASO 2: AUDIO
        await conn.sendMessage(m.chat, {
            audio: { url: dl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: m })

        // PASO 3: DOCUMENTO
        await conn.sendMessage(m.chat, {
            document: { url: dl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: m })

        await m.react('✅')

    } catch (err) {
        await m.react('❌')
        console.log("ERROR COMPLETO:", err)
        m.reply(`Error: ${err.response?.data?.msg || err.message}\n\nManda el nombre de la canción sola, sin "official video"`)
    }
}

handler.help = ['play1 <nombre>']
handler.tags = ['downloader']
handler.command = /^(play1)$/i
export default handler