import fetch from 'node-fetch'
import FormData from 'form-data' // <- IMPORTANTE

const API_KEY = 'garfield-vip'
const API_URL = `https://api.stellarwa.xyz/tools/removebg?key=${API_KEY}`

// ===== DISEÑO COTTI BOT =====
const D = {
    name: 'COTTI BOT',
    emoji: '🪷🌸',
    border: '╭── 𓆩🪷𓆪 ──╮',
    border2: '╰── 𓆩🌸𓆪 ──╯',
    title: '𝐂𝐎𝐓𝐓𝐈 𝐑𝐄𝐌𝐁𝐆', // <-- Corregido
    footer: '> "Florece sin fondo" 🦋',
    process: '🪷 QUITANDO FONDO',
    found: '🌸 FONDO ELIMINADO',
    error: '🥀 NO FLORECIÓ'
}

const handler = async (m, { conn }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''

        if (!mime || !/image/.test(mime)) return m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗘𝗟𝗜𝗠𝗜𝗡𝗔𝗗𝗢𝗥 𝗗𝗘 𝗙𝗢𝗡𝗗𝗢

──愛 *COMO USAR* ╏ ❄️
💭 ➛ Responde a una imagen con:.removebg
💭 ➛ O manda imagen con caption .removebg

${D.border2}
${D.footer}
━━━━━━━━━━━`)

        await m.react('🪷')
        await m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ ${D.process} ：✿ 。

  ꒱ ׁ. ᘏ 𝗣𝗥𝗢𝗖𝗘𝗦𝗢 ׅ 𝆬 ָ֢ ෆ
💭 ➛ Procesando imagen...
💭 ➛ Espera unos segundos 🌸

${D.border2}`)

        // 1. Descargar imagen
        let buffer = await q.download()
        if (!buffer) throw 'Error al descargar la imagen'

        // 2. Enviar a la API - ARREGLADO
        const form = new FormData()
        form.append('image', buffer, { filename: 'image.jpg', contentType: mime })
        
        const res = await fetch(API_URL, {
            method: 'POST',
            body: form,
            headers: form.getHeaders() // <- IMPORTANTE PARA FORM-DATA
        })

        if (!res.ok) throw `Error ${res.status}: ${await res.text()}`
        
        const result = await res.json()
        
        if (!result.status || !result.result) throw 'La API no devolvió imagen'

        const imageUrl = result.result 

        // 3. Descargar imagen resultante
        const imageBuffer = await fetch(imageUrl).then(v => v.buffer())

        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: `${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ ${D.found} ：✿ 。

  ꒱ ׁ. ᘏ 𝗥𝗘𝗦𝗨𝗟𝗧𝗔𝗗𝗢 ׅ 𝆬 ָ֢ ෆ
📌 ➛ Fondo eliminado con éxito
📌 ➛ Ya puedes usarla como sticker

${D.border2}
${D.footer}
━━━━━━━━━━━`
        }, { quoted: m })

        await m.react('✅')

    } catch(e) {
        await m.react('❌')
        m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.⚠️꒷

 ⤷ ┇ ${D.error} ：✿ 。

──愛 *FALLA* ╏ ❄️
⚠️ ➛ ${e.message || e}

${D.border2}`)
    }
}

handler.help = ['removebg']
handler.tags = ['herramientas', 'ia']
handler.command = ['removebg', 'bg', 'quitafondo']
export default handler