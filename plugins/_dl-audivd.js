import { join } from 'path'
import { promises as fs } from 'fs'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

// FUNCION PARA REACCIONES
const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

const handler = async (m, { conn }) => {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''

    if (!/video/.test(mime)) {
        let menuUso = `𐔌 ꒱ ***.audivd*** 𐔌 ꒱ 🎵

.⃟𖥔 ݁. 𖦹˙— \`\`HERRAMIENTA\`\` —˙𖦹.⚙️꒷

── *📝 DESCRIPCIÓN* ╏
🎵 ➛ Extrae el audio de un video
🎵 ➛ Convierte a MP3 192kbps

── *📖 USO* ╏
1️⃣ ➛ Responde a un video con:.*audivd*
2️⃣ ➛ O usa el alias:.*audio*

── *📦 FORMATO* ╏
⬇️ ➛ Salida: *MP3 44.1kHz Stereo*

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuUso }, { quoted: m })
    }

    let tempVideo
    let tempAudio
    try {
        await react(conn, m, "⏳")
        await m.reply(`𐔌 ꒱ ***.audivd*** 𐔌 ꒱ ⏳

.⃟𖥔 ݁. 𖦹˙— \`\`PROCESANDO\`\` —˙𖦹.⚙️꒷

── *📊 ESTADO* ╏
📥 ➛ Descargando video...
🎵 ➛ Extrayendo audio...
⚙️ ➛ Convirtiendo a MP3...

━━━━━━━━━━━`)

        const videoBuffer = await q.download()
        if (!videoBuffer) throw new Error('No se pudo obtener el buffer del video.')

        const tempDir = join(process.cwd(), './tmp')
        await fs.stat(tempDir).catch(() => fs.mkdir(tempDir, { recursive: true }))

        tempVideo = join(tempDir, `${Date.now()}.mp4`)
        tempAudio = join(tempDir, `${Date.now()}.mp3`)

        await fs.writeFile(tempVideo, videoBuffer)

        await execFileAsync('ffmpeg', [
            '-y',
            '-i', tempVideo,
            '-vn',
            '-ar', '44100',
            '-ac', '2',
            '-b:a', '192k',
            tempAudio
        ], { timeout: 120000 })

        const audioBuffer = await fs.readFile(tempAudio)

        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: 'audio_extraido.mp3',
            ptt: false
        }, { quoted: m })

        await react(conn, m, "✅")
        let menuOk = `𐔌 ꒱ ***.audivd*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`COMPLETADO\`\` —˙𖦹.🎵꒷

── *📊 RESULTADO* ╏
✅ ➛ Audio extraído correctamente
📌 ➛ Formato: *MP3 192kbps*
📌 ➛ Calidad: *44.1kHz Stereo*

── *📥 DESCARGA* ╏
⬇️ ➛ Archivo enviado arriba

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuOk }, { quoted: m })

    } catch (e) {
        console.error(e)
        await react(conn, m, "❌")
        let menuErr = `𐔌 ꒱ ***.audivd*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 DESCRIPCIÓN* ╏
❌ ➛ ${e.message}

── *💡 SOLUCIÓN* ╏
🔧 ➛ Usa un video válido
🔧 ➛ Máx 2 minutos recomendado

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuErr }, { quoted: m })
    } finally {
        await fs.unlink(tempVideo).catch(() => {})
        await fs.unlink(tempAudio).catch(() => {})
    }
}

handler.help = ['audivd', 'audio']
handler.tags = ['herramienta']
handler.command = ['audivd', 'audio']
handler.limit = true
export default handler