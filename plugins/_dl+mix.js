import axios from 'axios'
import FormData from 'form-data'
import { downloadContentFromMessage } from "@whiskeysockets/baileys"

// ===== CONFIG API STELLAR =====
const api = {
    url: 'https://api.stellarwa.xyz',
    key: 'proyectsV2' // Solo esta key
}

function generateUniqueFilename(mime) {
  const ext = mime.split('/')[1] || 'jpg'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${id}.${ext}`
}

async function uploadToUguu(buffer, mime) {
  const body = new FormData()
  body.append('files[]', buffer, generateUniqueFilename(mime))
  const res = await axios.post('https://uguu.se/upload.php', body, {
    headers: body.getHeaders(),
    timeout: 30000
  })
  const url = res.data?.files?.[0]?.url
  if (!url) throw new Error('No se pudo subir a Uguu')
  return url
}

async function upscaleImage(url) {
  const apiUrl = `${api.url}/tools/upscale?url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 })
  if (!res.data) throw new Error('Stellar HD no devolvió imagen')
  return Buffer.from(res.data)
}

async function removeBgFromUrl(url) {
  const apiUrl = `${api.url}/tools/removebg?url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 })
  if (!res.data) throw new Error('Stellar RemoveBG no devolvió imagen')
  return Buffer.from(res.data)
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (!mime) {
        let menuUso = `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ 🖼️

.⃟𖥔 ݁. 𖦹˙— \`\`IA\`\` —˙𖦹.✨꒷

── *📝 DESCRIPCIÓN* ╏
🖼️ ➛ Mejora la calidad de una imagen a HD 2x
🖼️ ➛ Elimina el fondo automáticamente

── *📖 USO* ╏
1️⃣ ➛ Responde a una imagen con:.*${command}*
2️⃣ ➛ Envía formatos: JPG o PNG

── *⚙️ PROCESO* ╏
⬆️ ➛ Paso 1: Mejora a HD 2x
🗑️ ➛ Paso 2: Quita el fondo
📤 ➛ Paso 3: Envía imagen + documento

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuUso }, { quoted: m })
    }

    if (!/image\/(jpe?g|png)/.test(mime)) {
        let menuError = `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 DESCRIPCIÓN* ╏
❌ ➛ Solo se aceptan imágenes JPG/PNG

── *📖 USO* ╏
➛ Responde a una imagen con:.*${command}*

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuError }, { quoted: m })
    }

    try {
        await m.react('⏳')
        await m.reply(`𐔌 ꒱ ***.${command}*** 𐔌 ꒱ ⏳

.⃟𖥔 ݁. 𖦹˙— \`\`PROCESANDO\`\` —˙𖦹.⚙️꒷

── *📊 ESTADO* ╏
⬆️ ➛ Mejorando calidad a HD 2x...
🗑️ ➛ Eliminando fondo...
📤 ➛ Subiendo resultado...

━━━━━━━━━━━`)

        // Proceso completo
        const buffer = await q.download()
        const uploadedUrl = await uploadToUguu(buffer, mime)
        const hdBuffer = await upscaleImage(uploadedUrl)
        const hdUrl = await uploadToUguu(hdBuffer, 'image/png')
        const finalBuffer = await removeBgFromUrl(hdUrl)

        // Mensaje 1: Imagen
        await conn.sendMessage(m.chat, {
            image: finalBuffer,
            caption: `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`COMPLETADO\`\` —˙𖦹.✨꒷

── *📊 RESULTADO* ╏
📌 ➛ Calidad: *HD 2x*
📌 ➛ Fondo: *Eliminado*
📌 ➛ Formato: *PNG Transparente*

── *📥 DESCARGA* ╏
⬇️ ➛ También se envió como documento

━━━━━━━━━━━`
        }, { quoted: m })

        // Mensaje 2: Documento
        await conn.sendMessage(m.chat, {
            document: finalBuffer,
            fileName: 'image-nobg.png',
            mimetype: 'image/png',
            caption: `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ 📄

.⃟𖥔 ݁. 𖦹˙— \`\`DOCUMENTO\`\` —˙𖦹.📄꒷

── *📊 INFO* ╏
📄 ➛ Imagen PNG sin fondo
✨ ➛ Lista para usar en diseños

━━━━━━━━━━━`
        }, { quoted: m })

        await m.react('✅')

    } catch (err) {
        await m.react('❌')
        let menuErr = `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 DESCRIPCIÓN* ╏
❌ ➛ ${err.message || err}

── *💡 SOLUCIÓN* ╏
🔧 ➛ Usa una imagen clara JPG/PNG
🔧 ➛ Máx 10MB recomendado

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuErr }, { quoted: m })
    }
}

handler.help = ['removebg', 'rbg', 'nobg']
handler.tags = ['ia']
handler.command = /^(removebg|rbg|nobg)$/i
export default handler