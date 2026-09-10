import fetch from 'node-fetch'

// FUNCION PARA REACCIONES
const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

const handler = async (m, { args, conn }) => {
  try {
    if (!args[0]) {
      let menuUso = `𐔌 ꒱ ***.facebook*** 𐔌 ꒱ 📥

.⃟𖥔 ݁. 𖦹˙— \`\`DESCARGAS\`\` —˙𖦹.📱꒷

── *📝 DESCRIPCIÓN* ╏
📥 ➛ Descarga videos de Facebook
📥 ➛ Calidad: HD si está disponible

── *📖 USO* ╏
➛.*facebook* <link>
➛.*fb* <link>

── *💡 EJEMPLO* ╏
➛.*facebook* https://www.facebook.com/watch?v=123

── *🔗 SOPORTE* ╏
📱 ➛ facebook.com
📱 ➛ fb.watch

━━━━━━━━━━━`
      return conn.sendMessage(m.chat, { text: menuUso }, { quoted: m })
    }

    if (!args[0].match(/facebook\.com|fb\.watch/)) {
      await react(conn, m, '❌')
      let menuError = `𐔌 ꒱ ***.facebook*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 DESCRIPCIÓN* ╏
❌ ➛ El enlace no es válido

── *📖 USO* ╏
➛ Solo links de: *facebook.com* o *fb.watch*

━━━━━━━━━━━`
      return conn.sendMessage(m.chat, { text: menuError }, { quoted: m })
    }

    await react(conn, m, '⏳')
    await m.reply(`𐔌 ꒱ ***.facebook*** 𐔌 ꒱ ⏳

.⃟𖥔 ݁. 𖦹˙— \`\`PROCESANDO\`\` —˙𖦹.⚙️꒷

── *📊 ESTADO* ╏
🔍 ➛ Analizando enlace...
📥 ➛ Obteniendo video...
⬇️ ➛ Preparando descarga...

━━━━━━━━━━━`)

    const api = `https://yosoyyo-api-ofc.onrender.com/api/facebook?url=${encodeURIComponent(args[0])}&apiKey=yosoyyo_sk_2nbk5m69`
    const res = await fetch(api)
    const json = await res.json()

    const data = json.result || json.data || json

    const info = data.info || {}
    const author = data.author || {}
    const media = data.media || {}

    const videoUrl = media.video_hd || media.video_sd

    if (!videoUrl) {
      await react(conn, m, '❌')
      let menuNoVideo = `𐔌 ꒱ ***.facebook*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 DESCRIPCIÓN* ╏
❌ ➛ No se pudo obtener el enlace de descarga

── *💡 SOLUCIÓN* ╏
🔧 ➛ Verifica que el video sea público
🔧 ➛ Intenta con otro enlace

━━━━━━━━━━━`
      return conn.sendMessage(m.chat, { text: menuNoVideo }, { quoted: m })
    }

    const titulo = info.title || 'Video de Facebook'
    const duracion = info.duration || 'Desconocida'
    const autorTxt = author.username || 'Desconocido'

    await conn.sendFile(
      m.chat,
      videoUrl,
      'facebook.mp4',
      `𐔌 ꒱ ***.facebook*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`COMPLETADO\`\` —˙𖦹.📥꒷

── *📊 INFORMACIÓN* ╏
📌 ➛ Título: *${titulo}*
⏱️ ➛ Duración: *${duracion}*
👤 ➛ Autor: *${autorTxt}*

── *📥 DESCARGA* ╏
⬇️ ➛ Enviando video...

━━━━━━━━━━━`,
      m
    )

    await react(conn, m, '✅')

  } catch (error) {
    console.log('Facebook API Error:', error.message)
    await react(conn, m, '❌')
    let menuErr = `𐔌 ꒱ ***.facebook*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 DESCRIPCIÓN* ╏
❌ ➛ ${error.message}

── *💡 SOLUCIÓN* ╏
🔧 ➛ Verifica tu conexión
🔧 ➛ Intenta más tarde

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: menuErr }, { quoted: m })
  }
}

handler.command = ['facebook', 'fb']
handler.tags = ['descargas']
handler.help = ['facebook <link>']
handler.limit = true
export default handler