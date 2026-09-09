import fetch from 'node-fetch'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
const execPromise = promisify(exec)

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`😼 *Ejemplo:* ${usedPrefix + command} cuéntame un chiste de lasaña`)
    
    await m.reply(`🤖 *Garfield* pensando...`)
    
    try {
        // 1. PEDIR RESPUESTA A GEMINI
        let aiUrl = `https://api.stellarwa.xyz/ai/gemini?text=${encodeURIComponent(text + ". Responde como Garfield, gracioso, con emojis, máximo 2 lineas")}&key=garfield-vip`
        let aiRes = await fetch(aiUrl)
        let aiJson = await aiRes.json()
        
        let respuesta = aiJson.result || aiJson.data || "Miau, no entendí 🐱"
        
        // 2. CONVERTIR TEXTO A VOZ CON GOOGLE TTS
        let ttsUrl = `https://api.stellarwa.xyz/tts?text=${encodeURIComponent(respuesta)}&lang=es`
        let ttsRes = await fetch(ttsUrl)
        let audioBuffer = await ttsRes.buffer()
        
        // 3. ENVIAR AUDIO
        await conn.sendMessage(m.chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/mpeg', 
            ptt: true // ptt:true = nota de voz
        }, { quoted: m })
        
        // También manda el texto por si acaso
        await m.reply(respuesta)
        
    } catch (e) {
        console.log(e)
        await m.reply(`⚠️ Error: Gemini o TTS falló. Intenta de nuevo`)
    }
}

handler.help = ['garfield <texto>']
handler.tags = ['ai']
handler.command = ['garfield', 'gato', 'habla']
handler.register = false

export default handler