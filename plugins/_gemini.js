import fs from 'fs'
import * as googleTTS from 'google-tts-api'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        let texto = `
🐱 *𓆩 ***Garfield Bot Oficial*** 𓆪* 🐱

.⃟𖥔 ݁. 𖦹˙— *\`\`IA CON VOZ\`\`* —˙𖦹.🍃꒷

 *⤷ ┇ USO* ：✿ 。

──🍃 *EJEMPLO* ╏ 💚
💚 ➛ ${usedPrefix}ia ¿qué día es hoy?
💚 ➛ ${usedPrefix}ia explícame el universo

──🍃 *NOTA* ╏ 🌿
🌿 ➛ *Te responderé con notas de voz*

━━━━━━━━━━━
*Owner*: @51927174369
> *"Pregúntame y te contesto maullando"* 🍕`
        await m.react('❌')
        return m.reply(texto)
    }

    await m.react('⏳')

    try {
        // 1. PEDIR RESPUESTA A GEMINI
        let aiUrl = `https://api.stellarwa.xyz/ai/gemini?text=${encodeURIComponent(text + ". Responde de forma normal, clara y amable como Garfield. Con humor")}&key=proyectsV2`
        let aiRes = await fetch(aiUrl)
        let aiJson = await aiRes.json()

        let respuesta = aiJson.result || aiJson.data || aiJson.response || "No pude entender eso humano"

        // 2. DIVIDIR EN PEDAZOS DE 200 CARACTERES PARA GOOGLE TTS
        let chunks = []
        for (let i = 0; i < respuesta.length; i += 200) {
            chunks.push(respuesta.substring(i, i + 200))
        }

        if(chunks.length > 1) await m.reply(`🐱 *Enviando ${chunks.length} audios...*`)

        // 3. ENVIAR AUDIO POR CADA PEDAZO - MISMO TTS QUE TU GARFIELD.JS
        for (let i = 0; i < chunks.length; i++) {
            let chunk = chunks[i]

            let url = googleTTS.getAudioUrl(chunk, {
                lang: 'es',
                slow: false,
                host: 'https://translate.google.com',
                timeout: 10000,
            })

            let tmpFilePath = path.join(tmpdir(), `garfield-ia-${Date.now()}-${i}.opus`)

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

            // Esperar entre audios
            await new Promise(resolve => setTimeout(resolve, 600))
        }

        await m.react('✅')

    } catch (e) {
        console.log(e)
        await m.react('❌')
        let texto = `
🐱 *𓆩 ***Garfield Bot Oficial*** 𓆪* 🐱

.⃟𖥔 ݁. 𖦹˙— *\`\`ERROR\`\`* —˙𖦹.🍃꒷

 *⤷ ┇ FALLÓ* ：✿ 。

──🍃 *MOTIVO* ╏ 💚
💚 ➛ ${e.message}

──🍃 *NOTA* ╏ 🌿
🌿 ➛ *Intenta de nuevo más tarde*

━━━━━━━━━━━
*Owner*: @51927174369
> *"Hasta yo me canso a veces"* 🍕`
        return m.reply(texto)
    }
}

handler.help = ['ia <texto>']
handler.tags = ['ai']
handler.command = ['ia', 'bot', 'voz']
handler.register = false

export default handler