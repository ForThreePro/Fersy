import ytsearch from "yt-search"
import fetch from "node-fetch"

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

const getBuffer = async (url) => {
    const res = await fetch(url)
    if(!res.ok) throw new Error('No se pudo descargar el buffer')
    return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn, command }) => {
    let text = m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || ''
    text = text.replace(`.${command}`, '').trim()

    if (!text) {
        return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***.descargas*** 𐔌 ꒱ 🎵

.⃟𖥔 ݁. 𖦹˙— \`\`USO\`\` —˙𖦹.📥꒷

1️⃣ ➛.*play1* <nombre de canción>
2️⃣ ➛.*ttmp3* <link de tiktok>
3️⃣ ➛.*fb* <link de facebook>

━━━━━━━━━━━` }, { quoted: m })
    }

    await react(conn, m, '⏳')
    try {
        // ===== YOUTUBE MP3 =====
        if (command === 'play1') {
            await m.reply(`𐔌 ꒱ ***.play1*** 𐔌 ꒱ ⏳\nBuscando y descargando...`)
            const searchResult = await ytsearch(text)
            if (!searchResult.videos.length) throw new Error("No se encontró la canción.")
            const video = searchResult.videos[0]

            const apiUrl = `${api.url}/dl/ytmp3?url=${encodeURIComponent(video.url)}&key=${api.key}`
            const resDl = await fetch(apiUrl).then(r => r.json())
            const dl = resDl?.data?.dl || resDl?.data?.download
            if (!dl) throw new Error('No se pudo descargar el audio de YT')

            const audioBuffer = await getBuffer(dl)
            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, { 
                audio: audioBuffer, 
                mimetype: 'audio/mpeg', 
                fileName: `${video.title}.mp3`
            }, { quoted: m })
        }

        // ===== TIKTOK MP3 =====
        if (command === 'ttmp3') {
            await m.reply(`𐔌 ꒱ ***.ttmp3*** 𐔌 ꒱ ⏳\nDescargando audio de TikTok...`)
            const apiUrl = `${api.url}/dl/tiktokmp3?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl).then(r => r.json())
            const data = res?.data || res?.result
            let dl = data?.download || data?.dl || data?.music
            const title = data?.title || 'TikTok'
            if (!dl) throw new Error('No se pudo descargar. Link mal o privado')

            const audioBuffer = await getBuffer(dl)
            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, { 
                audio: audioBuffer, 
                mimetype: 'audio/mpeg', 
                fileName: `${title}.mp3` 
            }, { quoted: m })
        }

        // ===== FACEBOOK VIDEO =====
        if (command === 'fb' || command === 'facebook') {
            await m.reply(`𐔌 ꒱ ***.fb*** 𐔌 ꒱ ⏳\nDescargando de Facebook...`)
            const apiUrl = `${api.url}/dl/facebook?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl)

            let videoBuffer
            const ct = res.headers.get('content-type')
            if(ct?.includes('application/json')){
                const data = await res.json()
                if(!data.status) throw new Error(data.message || 'Error API')
                videoBuffer = await getBuffer(data.result.url)
            } else {
                videoBuffer = Buffer.from(await res.arrayBuffer())
            }

            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, { 
                video: videoBuffer, 
                caption: `✅ Descargado\n⬇️ Andreitap Ventas 💗` 
            }, { quoted: m })
        }

        await react(conn, m, '✅')
    } catch (e) {
        await react(conn, m, '❌')
        console.log("ERROR:", e)
        return conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
    }
}

handler.help = ['play1 <nombre>', 'ttmp3 <link>', 'fb <link>']
handler.tags = ['descargas']
handler.command = /^(play1|ttmp3|fb|facebook)$/i  // <-- ya solo ttmp3
handler.register = false
export default handler