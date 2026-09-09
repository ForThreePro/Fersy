import fs from 'fs'
import * as googleTTS from 'google-tts-api'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        let texto = `
🤖 *IA PERUANA CON VOZ* 🇵🇪

*⤷ ┇ USO* 

── *EJEMPLO* ╏ 
➛ ${usedPrefix}ia ¿qué día es hoy?
➛ ${usedPrefix}ia explícame el universo causa
➛ ${usedPrefix}ia dame un dato de Perú

*⤷ ┇ NOTA* ╏ 
➛ *Te respondo con audios y modo peruano pe*
`
        await m.react('❌')
        return m.reply(texto)
    }

    await m.react('⏳')

    try {
        // 1. PEDIR RESPUESTA A GEMINI EN MODO PERUANO
        let aiUrl = `https://api.stellarwa.xyz/ai/gemini?text=${encodeURIComponent(text + ". Responde en español de Perú. Usa jerga peruana normal: pe, causa, mano, pata, bacán, chévere, ya fue. Sé amable y directo. Máximo 4 párrafos")}&key=proyectsV2`
        let aiRes = await fetch(aiUrl)
        let aiJson = await aiRes.json()

        let respuesta = aiJson.result || aiJson.data || aiJson.response || "No te entendí pe causa"

        // 2. DIVIDIR EN PEDAZOS DE 200 CARACTERES
        let chunks = []
        for (let i = 0; i < respuesta.length; i += 200) {
            chunks.push(respuesta.substring(i, i + 200))
        }

        if(chunks.length > 1) await m.reply(`🤖 *Enviando ${chunks.length} audios...*`)

        // 3. ENVIAR AUDIO POR CADA PEDAZO
        for (let i = 0; i < chunks.length; i++) {
            let chunk = chunks[i]

            let url = googleTTS.getAudioUrl(chunk, {
                lang: 'es',
                slow: false,
                host: 'https://translate.google.com',
                timeout: 10000,
            })

            let tmpFilePath = path.join(tmpdir(), `ia-pe-${Date.now()}-${i}.opus`)

            await new Promise((resolve, reject) => {
                ffmpeg(url)
              .audioCodec('libopus')
              .toFormat('opus')
              .outputOptions([
                        '-avoid_negative_ts make_zero',
                        '-ac 1',
                        '-b:a 64k'
                    ])
              .on('end', () => resolve(true))
              .on('error', (err) => reject(err))
              .save(tmpFilePath)
            })

            let audioBuffer = fs.readFileSync(tmpFilePath)

            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: m })

            if (fs.existsSync(tmpFilePath)) fs.unlinkSync(tmpFilePath)

            await new Promise(resolve => setTimeout(resolve, 600))
        }

        await m.react('✅')

    } catch (e) {
        console.log(e)
        await m.react('❌')
        await m.reply(`⚠️ Error: ${e.message}\n\nIntenta de nuevo pe`)
    }
}

handler.help = ['ia <texto>']
handler.tags = ['ai']
handler.command = ['ia', 'bot', 'voz']
handler.register = false

export default handler