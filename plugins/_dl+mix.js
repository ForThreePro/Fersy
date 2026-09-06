import axios from "axios"
import fetch from 'node-fetch'
import sharp from "sharp"

// ===== CONFIG API STELLAR =====
const api = {
    url: 'https://api.stellarwa.xyz',
    key: 'proyectsV2'
}

// ===== DISEÑO GARFIELD BOT =====
const D = {
    name: 'GARFIELD BOT',
    emoji: '🐱🍝',
    border: '╭─── 𓆩🐱𓆪 ───╮',
    border2: '╰─── 𓆩🍝𓆪 ───╯',
    footer: '> "Descargando como lasaña" 😼',
    process: '🐱 DESCARGANDO',
    found: '🍝 LISTO',
    error: '😿 NO SE PUDO'
}

async function instagramDL(urls, m, sock) {
    const medias = []
    for (const url of urls.slice(0, 10)) {
        try {
            const res = await axios.get(`${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`)
            const json = res.data
            if (!json.status ||!json.data ||!json.data.download) continue
            for (const media of json.data.download.slice(0, 10)) {
                if (media.type === "video") {
                    medias.push({ type: "video", data: { url: media.url } })
                } else {
                    medias.push({ type: "image", data: { url: media.url } })
                }
            }
        } catch {}
    }
    if (medias.length) {
        await sock.sendAlbumMessage(m.chat, medias, { quoted: m })
    } else {
        throw 'No se pudieron procesar los enlaces'
    }
}

async function spotifyDL(query, m, sock) {
    let url, songInfo

    if (/open\.spotify\.com\/track\//i.test(query)) {
        url = query
        const resInfo = await fetch(`${api.url}/dl/spotify?url=${encodeURIComponent(url)}&key=${api.key}`)
        const resultInfo = await resInfo.json()
        if (!resultInfo.status) throw 'No se pudo procesar el enlace de Spotify'
        songInfo = resultInfo.data
    } else {
        const search = await fetch(`${api.url}/search/spotify?query=${encodeURIComponent(query)}&key=${api.key}`)
        const data = await search.json()
        if (!data.status ||!data.data.length) throw 'No se encontraron resultados en Spotify'
        songInfo = data.data[0]
        url = songInfo.url
    }

    const duracion = (!songInfo.duration || songInfo.duration.includes('NaN'))? 'Desconocida' : songInfo.duration
    const caption = `${D.border}\n${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}\n\n➪ Descargando › ${songInfo.title}\n\n> ✿ Artista › ${songInfo.artist}\n> ✿ Álbum › ${songInfo.album}\n> ✿ Duración › ${duracion}\n\n${D.border2}`

    await sock.sendMessage(m.chat, { image: { url: songInfo.image }, caption }, { quoted: m })

    const resAudio = await fetch(`${api.url}/dl/spotify?url=${encodeURIComponent(url)}&key=${api.key}`)
    const resultAudio = await resAudio.json()
    if (!resultAudio.status ||!resultAudio.data?.dl) throw 'No se pudo descargar el audio'

    const audioBuffer = Buffer.from(await (await fetch(resultAudio.data.dl)).arrayBuffer())
    const bannerBuffer = await getBuffer(resultAudio.data.cover)
    const thumbBuffer2 = await sharp(bannerBuffer).resize(300, 300).jpeg({ quality: 80 }).toBuffer()

    await sock.sendMessage(m.chat, {
        document: audioBuffer,
        mimetype: "audio/mpeg",
        fileName: `${resultAudio.data.title}.mp3`,
        jpegThumbnail: thumbBuffer2,
        caption: `${D.border}\n⤷ ┇ ${D.found}\n${D.border2}`
    }, { quoted: m })
}

async function facebookDL(urls, m, sock) {
    if (urls.length > 1) {
        const medias = []
        for (const url of urls.slice(0, 10)) {
            try {
                const apiUrl = `${api.url}/dl/facebookv2?url=${url}&key=${api.key}`
                const res = await fetch(apiUrl)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const buffer = await res.buffer()
                medias.push({ type: 'video', data: buffer })
            } catch {}
        }
        if (medias.length) {
            await sock.sendAlbumMessage(m.chat, medias, { quoted: m })
        } else {
            throw 'No se pudieron procesar los enlaces'
        }
    } else {
        const url = urls[0]
        const apiUrl = `${api.url}/dl/facebookv2?url=${url}&key=${api.key}`
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buffer = await res.buffer()

        await sock.sendMessage(
            m.chat,
            { video: buffer, mimetype: 'video/mp4', fileName: 'fb.mp4', caption: `${D.border}\n⤷ ┇ ${D.found}\n${D.border2}` },
            { quoted: m }
        )
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— 𝐆𝐀𝐑𝐅𝐈𝐄𝐋𝐃 𝐃𝐋 —˙𖦹.💭꒷

 ⤷ ┇ 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗗𝗢𝗥 𝟯 𝗘𝗡 𝟭

──愛 *COMANDOS* ╏ ❄️
💭 ➛ ${usedPrefix}ig <link> : Instagram
💭 ➛ ${usedPrefix}sp <nombre/link> : Spotify
💭 ➛ ${usedPrefix}fb <link> : Facebook

${D.border2}
${D.footer}
━━━━━━━━━━━`)
    }

    try {
        await m.react('🐱')
        await m.reply(`${D.border}\n⤷ ┇ ${D.process} ：✿ 。\n${D.border2}`)

        if (['ig', 'instagram', 'reel'].includes(command)) {
            const urls = args.filter(arg => arg.match(/instagram\.com\/(p|reel|share|tv)\//))
            if (!urls.length) throw 'El enlace no parece *válido* de Instagram'
            await instagramDL(urls, m, conn)
        }

        else if (['sp', 'spotify'].includes(command)) {
            await spotifyDL(args.join(' '), m, conn)
        }

        else if (['fb', 'facebook'].includes(command)) {
            const urls = args.filter(arg => arg.match(/facebook\.com|fb\.watch|video\.fb\.com/))
            if (!urls.length) throw 'El enlace no parece *válido* de Facebook'
            await facebookDL(urls, m, conn)
        }

        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        await m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

 ⤷ ┇ ${D.error} ：✿ 。

⚠️ ➛ ${e.message || e}

${D.border2}`)
    }
}

handler.help = ['ig', 'sp', 'fb']
handler.tags = ['downloader']
handler.command = ['ig', 'instagram', 'reel', 'sp', 'spotify', 'fb', 'facebook']
export default handler