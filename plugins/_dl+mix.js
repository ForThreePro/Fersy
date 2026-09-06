import axios from "axios"
import { downloadContentFromMessage } from "@whiskeysockets/baileys"

// ===== CONFIG API STELLAR =====
const api = {
    url: 'https://api.stellarwa.xyz',
    key: 'garfield-vip'
}

// ===== DISEÑO GARFIELD BOT =====
const D = {
    name: 'GARFIELD BOT',
    emoji: '🐱🍝',
    border: '╭─── 𓆩🐱𓆪 ───╮',
    border2: '╰─── 𓆩🍝𓆪 ───╯',
    title: '𝐑𝐄𝐌𝐎𝐕𝐄 𝐁𝐆',
    process: '🐱 QUITANDO FONDO',
    found: '🍝 LISTO',
    error: '😿 NO SE PUDO'
}

let handler = async (m, { conn, usedPrefix }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!mime) {
      return m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ Responde a una *imagen* o manda una imagen ：✿ 。

Ejemplo: ${usedPrefix}removebg

${D.border2}`)
    }
    
    if (!/image\/(jpe?g|png)/.test(mime)) {
      return m.reply(`${D.border}\n⚠️ ➛ Solo se acepta imagen JPG/PNG\n${D.border2}`)
    }

    try {
      await m.react('🐱')
      await m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

 ⤷ ┇ ${D.process} ：✿ 。

  ꒱ ׁ. ᘏ 𝗣𝗥𝗢𝗖𝗘𝗦𝗢 ׅ 𝆬 ָ֢ ෆ
💭 ➛ Subiendo imagen...
💭 ➛ API: Stellar garfield-vip

${D.border2}`)

      // Descargar imagen
      let stream = await downloadContentFromMessage(q, 'image')
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      // Convertir a base64 para enviar a Stellar
      let base64 = buffer.toString('base64')
      
      // Enviar a API Stellar removebg
      const { data } = await axios.post(`${api.url}/tools/removebg?key=${api.key}`, {
        image: base64
      }, { timeout: 60000 })

      if (!data.status || !data.data?.url) throw data.message || 'API no devolvió imagen'

      // Enviar resultado
      await conn.sendMessage(m.chat, {
        image: { url: data.data.url },
        caption: `${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ ${D.found} ：✿ 。

${D.border2}
${D.footer}`
      }, { quoted: m })

      await m.react('✅')

    } catch (e) {
      await m.react('❌')
      await m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

 ⤷ ┇ ${D.error} ：✿ 。

──愛 *DETALLE* ╏ ❄️
⚠️ ➛ ${e.message || e}

──愛 *TIP* ╏ ❄️
💭 ➛ La imagen debe pesar menos de 10MB
💭 ➛ Intenta con otra foto si falla

${D.border2}`)
    }
}

handler.help = ['removebg', 'nobg']
handler.tags = ['tools']
handler.command = /^(removebg|nobg|rbg)$/i
export default handler