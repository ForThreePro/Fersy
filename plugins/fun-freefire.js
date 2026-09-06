let handler = async (m, { conn, command }) => {

global.db = global.db || {}
global.db.listas = global.db.listas || {}

let idLista = `vs16_${m.chat}`

// Reinicia la lista
global.db.listas[idLista] = {
    titulares: [],
    suplentes: [],
    maxTit: 4,
    maxSup: 2,
    msgId: '' // guardamos el id del mensaje
}

let lista = `߳₊🪭⋆.˚ 𝟦𝑽𝑺4 𝑺𝑼𝑹 ꒱ ˖ׄ ୭
╭ ꕀ ֹ
⌇ ⸝⸝ 🆚 𖥦 ﹕
⌇ ⸝⸝ ⏰ 𖥦 ﹕ _16 🇦🇷 ʾ 🇵🇪14_
╰ ☆⃞ 　 ʾ 　 ๑
╭ ꕀ ֹ
⌇ ◟✦ 𓏼𝑻𝑰𝑻𝑼𝑳𝑨𝑹𝑬𝑺﹕ 0/4
⌇🪭𐑞
⌇🪭𐑞
⌇🪭𐑞
⌇🪭𐑞
⌇ ◟✦ 𓏼𝑺𝑼𝑷𝑳𝑬𝑵𝑻𝑬𝑺﹕ 0/2
⌇🎐𐑞
⌇🎐𐑞
╰ ☆⃞ 　 ʾ 　 ๑
\`｡⁖. 𝑷𝒖𝒏𝒕𝒖𝒂𝒍𝒊𝒅𝒂𝒅 | 𝑺𝒊𝒏 𝒍𝒂𝒈 | 𝑹𝒆𝒔𝒑𝒆𝒕𝒐 ⁖｡\`

🎀 = Jugadora | 🌸 = Suplente | ❌ = Salir`

let msg = await conn.sendMessage(m.chat, { text: lista }, { quoted: m })

// Guardamos el id del mensaje para detectar reacciones
global.db.listas[idLista].msgId = msg.key.id

// El bot reacciona solo
await conn.sendMessage(m.chat, { react: { text: '🎀', key: msg.key }})
await conn.sendMessage(m.chat, { react: { text: '🌸', key: msg.key }})
await conn.sendMessage(m.chat, { react: { text: '❌', key: msg.key }})

}

handler.help = ['vs16']
handler.tags = ['ff']
handler.command = /^vs16$/i
export default handler

// ===== HANDLER PARA REACCIONES =====
export async function before(m, { conn }) {
    if (!m.message?.reactionMessage) return

    let reaction = m.message.reactionMessage.text
    let key = m.message.reactionMessage.key
    let user = m.sender
    let name = await conn.getName(user)

    // Buscar en que lista está esa reacción
    let idLista = Object.keys(global.db.listas).find(k => global.db.listas[k].msgId === key.id)
    if(!idLista) return

    let lista = global.db.listas[idLista]

    // Quitar de ambas listas primero
    lista.titulares = lista.titulares.filter(v => v.id!== user)
    lista.suplentes = lista.suplentes.filter(v => v.id!== user)

    if(reaction === '🎀'){
        if(lista.titulares.length < lista.maxTit){
            lista.titulares.push({id: user, name})
            await conn.sendMessage(m.chat, { text: `🎀 @${user.split('@')[0]} se anotó como TITULAR`, mentions: [user] }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { text: `⚠️ Ya hay 4 titulares. Usa 🌸 para suplente` }, { quoted: m })
        }
    }

    if(reaction === '🌸'){
        if(lista.suplentes.length < lista.maxSup){
            lista.suplentes.push({id: user, name})
            await conn.sendMessage(m.chat, { text: `🌸 @${user.split('@')[0]} se anotó como SUPLENTE`, mentions: [user] }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { text: `⚠️ Ya hay 2 suplentes` }, { quoted: m })
        }
    }

    if(reaction === '❌'){
        await conn.sendMessage(m.chat, { text: `❌ @${user.split('@')[0]} salió de la lista`, mentions: [user] }, { quoted: m })
    }

    // Actualizar lista
    let textoTit = lista.titulares.map((v,i) => `⌇🪭 ${i+1}. @${v.id.split('@')[0]}`).join('\n')
    let textoSup = lista.suplentes.map((v,i) => `⌇🎐 ${i+1}. @${v.id.split('@')[0]}`).join('\n')

    let texto = `߳₊🪭⋆.˚ 𝟦𝑽𝑺4 𝑺𝑼𝑹 ꒱ ˖ׄ ୭
╭ ꕀ ֹ
⌇ ⸝⸝ 🆚 𖥦 ﹕
⌇ ⸝⸝ ⏰ 𖥦 ﹕ _16 🇦🇷 ʾ 🇵🇪14_
╰ ☆⃞ 　 ʾ 　 ๑
╭ ꕀ ֹ
⌇ ◟✦ 𓏼𝑻𝑰𝑻𝑼𝑳𝑨𝑹𝑬𝑺﹕ ${lista.titulares.length}/4
${textoTit || '⌇🪭𐑞'}
⌇ ◟✦ 𓏼𝑺𝑼𝑷𝑳𝑬𝑵𝑻𝑬𝑺﹕ ${lista.suplentes.length}/2
${textoSup || '⌇🎐𐑞'}
╰ ☆⃞ 　 ʾ 　 ๑
\`｡⁖. 𝑷𝒖𝒏𝒕𝒖𝒂𝒍𝒊𝒅𝒂𝒅 | 𝑺𝒊𝒏 𝒍𝒂𝒈 | 𝑹𝒆𝒔𝒑𝒆𝒕𝒐 ⁖｡\`

🎀 = Jugadora | 🌸 = Suplente | ❌ = Salir`

    await conn.sendMessage(m.chat, {
        text: texto,
        mentions: [...lista.titulares.map(v=>v.id),...lista.suplentes.map(v=>v.id)]
    })
}