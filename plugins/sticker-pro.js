import { addExif, sticker } from '../lib/sticker.js'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    const error = (msg) => {
        return m.reply(`𐔌 ꒱ ***STICKERS*** 𐔌 ꒱ ⚠️\n\n.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷\n\n── *📝 AVISO* ╏\n❌ ➛ ${msg}\n━━━━━━━━━━━`)
    }

    await react('⏳')

    // 1. WM / TAKE / ROBAR
    if (command === 'wm' || command === 'take' || command === 'robar') {
        if (!m.quoted) return error('Responde a un *sticker*')
        let [packname,...author] = text.split('|')
        author = (author || []).join('|')
        let mime = m.quoted.mimetype || ''
        if (!/webp/.test(mime)) return error('Responde a un *sticker*')
        let img = await m.quoted.download()
        if (!img) return error('Responde a un *sticker*')

        try {
            let stiker = await addExif(img, packname || 'Sticker', author || '')
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
            await react('✅')
        } catch (e) {
            console.error(e)
            await react('❌')
            error('Error al editar el *sticker*')
        }
    }

    // 2. S / STICKER / STIKER
    if (command === 's' || command === 'sticker' || command === 'stiker') {
        let q = m.quoted? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        if (!/webp|image|video/g.test(mime)) return error('Responde a una *imagen, video o gif*')
        let img = await q.download()
        let stiker = await sticker(img, false, 'Sticker', '')
        await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
        await react('✅')
    }

    // 3. QC / QUOTLY
    if (command === 'qc' || command === 'quotly') {
        let mentionedJid = m.mentionedJid && m.mentionedJid[0]? m.mentionedJid[0] : null
        let authorName, txt, pp

        if (!args.length &&!(m.quoted && m.quoted.text)) 
            return error(`Ingresa un texto para el *sticker quotly*\n> Ejemplo: *${usedPrefix}qc Hola mundo*\n> Ejemplo: *${usedPrefix}qc @user Nombre / Texto*\n> Ejemplo: *${usedPrefix}qc Nombre / Texto*`)

        if (mentionedJid && args.join(" ").includes("/")) {
            const joined = args.slice(1).join(" ")
            const [authorNameRaw,...textParts] = joined.split("/")
            authorName = authorNameRaw?.trim() || "Anónimo"
            txt = textParts.join("/").trim()
            pp = await conn.profilePictureUrl(mentionedJid, 'image').catch(_ => 'https://telegra.ph/file/320b066dc81928b782c7b.png')
        } else if (!mentionedJid && args.join(" ").includes("/")) {
            const joined = args.join(" ")
            const [authorNameRaw,...textParts] = joined.split("/")
            authorName = authorNameRaw?.trim() || "Anónimo"
            txt = textParts.join("/").trim()
            pp = "https://files.catbox.moe/dpeqsr.jpg"
        } else if (!mentionedJid && args.length >= 1) {
            txt = args.join(" ")
            try {
                authorName = await conn.getName(m.sender)
            } catch {
                authorName = "Anónimo"
            }
            pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/320b066dc81928b782c7b.png')
        } else if (m.quoted && m.quoted.text) {
            txt = m.quoted.text
            try {
                authorName = await conn.getName(m.sender)
            } catch {
                authorName = "Anónimo"
            }
            pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/320b066dc81928b782c7b.png')
        } else {
            return error('Formato inválido')
        }

        if (!txt) return error('Ingresa un texto para el *sticker*')
        if (txt.length > 30) return error('Máximo *30 caracteres*')

        const obj = {
            "type": "quote", "format": "png", "backgroundColor": "#000", "width": 512, "height": 768, "scale": 2,
            "messages": [{"entities": [], "avatar": true, "from": { "id": 1, "name": authorName || "Anónimo", "photo": { "url": pp } }, "text": txt, "replyMessage": {}}]
        }

        try {
            const json = await axios.post('https://btzqc.betabotz.eu.org/generate', obj, { headers: { 'Content-Type': 'application/json' }})
            const buffer = Buffer.from(json.data.result.image, 'base64')
            const stiker = await sticker(buffer, false, 'Sticker', 'Bot')

            if (stiker) {
                await conn.sendFile(m.chat, stiker, 'quotly.webp', '', m)
                await react('✅')
            } else {
                await react('❌')
            }
        } catch (e) {
            console.error(e)
            await react('❌')
            error('Error al generar el *sticker*')
        }
    }

    // 4. EMOJIMIX / MIX
    if (command === 'emojimix' || command === 'mix') {
        let [emoji1, emoji2] = text.split(/[&+\s]+/)
        if (!emoji1 ||!emoji2) return error(`Uso: *${usedPrefix}emojimix* 😃+🔥`)

        let url = `https://api.evogb.org/tools/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}&key=sasuke`
        try {
            await conn.sendMessage(m.chat, { sticker: { url: url } }, { quoted: m })
            await react('✅')
        } catch (e) {
            await react('❌')
            error(`Error: ${e.message}`)
        }
    }
}

handler.help = ['wm <nombre>|<autor>', 's', 'qc <texto>', 'emojimix <emoji1>+<emoji2>']
handler.tags = ['sticker']
handler.command = /^(wm|take|robar|s|sticker|stiker|qc|quotly|emojimix|mix)$/i

export default handler