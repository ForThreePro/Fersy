import fetch from 'node-fetch'
import fs from 'fs'
import * as googleTTS from 'google-tts-api'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`🤖 *Ejemplo:* ${usedPrefix + command} explícame el universo`)
    
    await m.react('⏳')
    
    try {
        // 1. PEDIR RESPUESTA A GEMINI COMPLETA
        let aiUrl = `https://api.stellarwa.xyz/ai/gemini?text=${encodeURIComponent(text + ". Responde de forma normal, clara y amable. Puedes explayarte")}&key=garfield-vip`
        let aiRes = await fetch(aiUrl)
        let aiJson = await aiRes.json()
        
        let respuesta = aiJson.result || aiJson.data || aiJson.response || "No pude entender eso"
        
        // 2. DIVIDIR EN PEDAZOS DE 200 CARACTERES
        let chunks = []
        for (let i = 0; i < respuesta.length; i += 200) {
            chunks.push(respuesta.substring(i, i + 200))
        }
        
        await m.reply(`🤖 *Enviando ${chunks.length} audios...*`)
        
        // 3. ENVIAR AUDIO POR CADA PEDAZO
        for (let i = 0; i < chunks.length; i++) {
            let chunk = chunks[i]
            
            let url = googleTTS.getAudioUrl(chunk, {
                lang: 'es',
                slow: false,
                host: 'https://translate.google.com',
                timeout: 10000,
            })

            let tmpFilePath = path.join(tmpdir(), `ia-${Date.now()}-${i}.opus`)

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
            
            // Esperar 500ms entre audios para que no se trabe
            await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        await m.react('✅')

    } catch (e) {
        console.log(e)
        await m.react('❌')
        await m.reply(`⚠️ Error: ${e.message}`)
    }
}

handler.help = ['ia <texto>', 'bot <texto>']
handler.tags = ['ai']
handler.command = ['ia', 'bot', 'voz']
handler.register = false

export default handler