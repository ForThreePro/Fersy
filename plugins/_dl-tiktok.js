import fetch from 'node-fetch'
import { generateWAMessageFromContent, generateWAMessageContent, proto } from '@whiskeysockets/baileys'

// FUNCION PARA REACCIONES
const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

var handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    let menuUso = `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ 📱

.⃟𖥔 ݁. 𖦹˙— \`\`DESCARGAS\`\` —˙𖦹.📥꒷

── *📝 DESCRIPCIÓN* ╏
📱 ➛ Descarga videos de TikTok sin marca de agua
📱 ➛ Con botones interactivos

── *📖 USO* ╏
➛.*${command}* <link de tiktok>

── *💡 EJEMPLO* ╏
➛.*${command}* https://vm.tiktok.com/ZMkcmTCa6/

── *🔗 SOPORTE* ╏
📱 ➛ vm.tiktok.com
📱 ➛ vt.tiktok.com
📱 ➛ www.tiktok.com

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: menuUso }, { quoted: m })
  }

  const url = args[0]
  if (!url.match(/(https?:\/\/)?(www\.)?(vm\.|vt\.|www\.)?tiktok\.com\//)) {
    await react(conn, m, '❌')
    let menuError = `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 DESCRIPCIÓN* ╏
❌ ➛ El enlace no es válido

── *📖 USO* ╏
➛ Solo links de: *tiktok.com*

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: menuError }, { quoted: m })
  }

  try {
    await react(conn, m, "⏳")
    await m.reply(`𐔌 ꒱ ***.${command}*** 𐔌 ꒱ ⏳

.⃟𖥔 ݁. 𖦹˙— \`\`PROCESANDO\`\` —˙𖦹.⚙️꒷

── *📊 ESTADO* ╏
🔍 ➛ Analizando link de TikTok...
📥 ➛ Obteniendo video HD...
⬇️ ➛ Preparando descarga sin marca de agua...

━━━━━━━━━━━`)

    const tiktokData = await tiktokdl(url)
    if (!tiktokData?.data) throw new Error('No se pudo obtener el video.')

    const videoURL = tiktokData.data.play
    const title = tiktokData.data.title || 'Sin título'
    const author = tiktokData.data.author?.nickname || 'Desconocido'
    const likes = formatNum(tiktokData.data.digg_count)
    const comments = formatNum(tiktokData.data.comment_count)

    const businessHeader = {
      key: { remoteJid: m.chat, participant: '0@s.whatsapp.net', fromMe: false },
      message: {
        locationMessage: {
          name: `TikTok Downloader`,
          jpegThumbnail: Buffer.from(await (await fetch('https://files.catbox.moe/dsgmid.jpg')).arrayBuffer())
        }
      }
    }

    const media = await generateWAMessageContent({ video: { url: videoURL } }, { upload: conn.waUploadToServer, jid: m.chat })

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: {
              text: `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`COMPLETADO\`\` —˙𖦹.📥꒷

── *📊 INFORMACIÓN* ╏
📌 ➛ Título: *${title}*
👤 ➛ Autor: *@${author}*
❤️ ➛ Likes: *${likes}*
💬 ➛ Comentarios: *${comments}*

── *📥 DESCARGA* ╏
⬇️ ➛ Video sin marca de agua`
            },
            footer: { text: 'Descarga sin marca de agua ✨' },
            header: { hasMediaAttachment: true, videoMessage: media.videoMessage },
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                { name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: '📋 Copiar texto', copy_code: title }) },
                { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '📱 Ver en TikTok', url: url }) }
              ]
            })
          })
        }
      }
    }, { quoted: businessHeader })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await react(conn, m, "✅")

  } catch (error) {
    await react(conn, m, "❌")
    let menuErr = `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 DESCRIPCIÓN* ╏
❌ ➛ ${error.message}

── *💡 SOLUCIÓN* ╏
🔧 ➛ Verifica que el video sea público
🔧 ➛ Intenta con otro link

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: menuErr }, { quoted: m })
  }
}

async function tiktokdl(url) {
  const tikwm = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
  return await (await fetch(tikwm, { signal: AbortSignal.timeout(20000) })).json()
}

const formatNum = (n) => {
  n = Number(n)
  if (!n) return "0"
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toString()
}

handler.help = ['tiktok <link>']
handler.tags = ['descargas']
handler.command = ['tt', 'tiktok']
handler.limit = true
export default handler