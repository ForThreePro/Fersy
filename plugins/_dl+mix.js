import axios from "axios"

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
    title: '𝐆𝐀𝐑𝐅𝐈𝐄𝐋𝐃 𝐈𝐆',
    footer: '> "Bajando como lasaña" 😼',
    process: '🐱 DESCARGANDO',
    found: '🍝 LISTO',
    error: '😿 NO SE PUDO'
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args.length) {
      return m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗗𝗢𝗥 𝗗𝗘 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠

──愛 *COMO USAR* ╏ ❄️
💭 ➛ ${usedPrefix}ig <link>
💭 ➛ ${usedPrefix}reel <link>
💭 ➛ Soporta: Reel, Post, Carrusel, IGTV

──愛 *EJEMPLO* ╏ ❄️
💭 ➛ ${usedPrefix}ig https://www.instagram.com/reel/ABC123/

${D.border2}
${D.footer}
━━━━━━━━━━━`)
    }

    const urls = args.filter(arg => arg.match(/instagram\.com\/(p|reel|tv|share)\//i))
    if (!urls.length) {
      return m.reply(`${D.border}
⚠️ ➛ El enlace no parece *válido* de Instagram
${D.border2}`)
    }

    try {
      await m.react('🐱')
      await m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ ${D.process} ：✿ 。

  ꒱ ׁ. ᘏ 𝗣𝗥𝗢𝗖𝗘𝗦𝗢 ׅ 𝆬 ָ֢ ෆ
💭 ➛ Conectando con Stellar API...
💭 ➛ Key: proyectsV2
💭 ➛ Procesando ${urls.length} enlace(s)...

${D.border2}`)

      const medias = []
      let fallos = []
      
      for (const url of urls.slice(0, 10)) {
        try {
          const apiUrl = `${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`
          const { data } = await axios.get(apiUrl, { timeout: 30000 })
          
          if (!data.status) throw data.message || 'API devolvió status: false'
          if (!data.data) throw 'No se recibió data de la API'
          if (!data.data.download || !data.data.download.length) throw 'No hay archivos para descargar'

          const titulo = data.data.title || data.data.caption || 'Instagram'
          
          for (const media of data.data.download.slice(0, 10)) {
            const cap = `${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ ${D.found} ：✿ 。

  ꒱ ׁ. ᘏ 𝗗𝗘𝗧𝗔𝗟𝗘𝗦 ׅ 𝆬 ָ֢ ෆ
📌 ➛ Tipo: ${media.type}
📌 ➛ Título: ${titulo}

${D.border2}
${D.footer}`
            
            if (media.type === "video") {
              medias.push({ 
                type: "video", 
                data: { url: media.url },
                caption: cap
              })
            } else {
              medias.push({ 
                type: "image", 
                data: { url: media.url },
                caption: cap
              })
            }
          }
        } catch(e) {
          fallos.push(`• ${url}\n  Razón: ${e.message || e}`)
        }
      }

      if (medias.length) {
        if (medias.length === 1) {
          await conn.sendMessage(m.chat, medias[0], { quoted: m })
        } else {
          await conn.sendAlbumMessage(m.chat, medias, { quoted: m })
        }
        await m.react('✅')
      } else {
        throw `No se pudieron procesar los enlaces\n${fallos.join('\n\n')}`
      }

    } catch (e) {
      await m.react('❌')
      await m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.⚠️꒷

 ⤷ ┇ ${D.error} ：✿ 。

──愛 *DETALLE* ╏ ❄️
⚠️ ➛ ${e.message || e}

──愛 *SOLUCION* ╏ ❄️
💭 ➛ 1. El perfil/link debe ser público
💭 ➛ 2. Espera 2 min si la API está saturada

${D.border2}`)
    }
}

handler.help = ['ig', 'instagram', 'reel']
handler.tags = ['downloader']
handler.command = /^(ig|instagram|reel)$/i
export default handler