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
    msgId: ''
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

global.db.listas[idLista].msgId = msg.key.id

// El bot se reacciona solo
await conn.sendMessage(m.chat, { react: { text: '🎀', key: msg.key }})
await conn.sendMessage(m.chat, { react: { text: '🌸', key: msg.key }})
await conn.sendMessage(m.chat, { react: { text: '❌', key: msg.key }})

}

handler.help = ['vs16']
handler.tags = ['ff']
handler.command = /^vs16$/i
export default handler

// ESTO VA ABAJO DEL TODO Y ES LO IMPORTANTE
export async function before(m) {
    if (!m.message) return
    if (!m.message.reactionMessage) return

    let { conn } = global // agarra conn de global

    let reaction = m.message.reactionMessage.text
    let key = m.message.reactionMessage.key
    let user = m.sender
    let name = await conn.getName(user)

    // Buscar en que lista está
    let idLista = Object.keys(global.db.listas || {}).find(k => global.db.listas[k].msgId === key.id)
    if(!idLista) return

    let lista = global.db.listas[idLista]

    // Quitar de ambas
    lista.titulares = lista.titulares.filter(v => v.id!== user)
    lista.suplentes = lista.suplentes.filter(v => v.id!== user)

    let aviso = ''

    if(reaction === '🎀'){
        if(lista.titulares.length < lista.maxTit){
            lista.titulares.push({id: user, name})
            aviso = `🎀 @${user.split('@')[0]} se anotó como TITULAR`
        } else {
            aviso = `⚠️ Ya hay 4 titulares. Usa 🌸 para suplente`
        }
    }

    if(reaction === '🌸'){
        if(lista.suplentes.length < lista.maxSup){
            lista.suplentes.push({id: user, name})
            aviso = `🌸 @${user.split('@')[0]} se anotó como SUPLENTE`
        } else {
            aviso = `⚠️ Ya hay 2 suplentes`
        }
    }

    if(reaction === '❌'){
        aviso = `❌ @${user.split('@')[0]} salió de la lista`
    }

    if(aviso) await conn.sendMessage(m.chat, { text: aviso, mentions: [user] }, { quoted: m })

    // Actualizar lista
    let textoTit = lista.titulares.map((v,i) => `⌇🪭 ${i+1}. @${v.id.split('@')[0]}`).join('\n') || '⌇🪭𐑞'
    let textoSup = lista.suplentes.map((v,i) => `⌇🎐 ${i+1}. @${v.id.split('@')[0]}`).join('\n') || '⌇🎐𐑞'

    let texto = `߳₊🪭⋆.˚ 𝟦𝑽𝑺4 𝑺𝑼𝑹 ꒱ ˖ׄ ୭
╭ ꕀ ֹ
⌇ ⸝⸝ 🆚 𖥦 ﹕
⌇ ⸝⸝ ⏰ 𖥦 ﹕ _16 🇦🇷 ʾ 🇵🇪14_
╰ ☆⃞ 　 ʾ 　 ๑
╭ ꕀ ֹ
⌇ ◟✦ 𓏼𝑻𝑰𝑻𝑼𝑳𝑨𝑹𝑬𝑺﹕ ${lista.titulares.length}/4
${textoTit}
⌇ ◟✦ 𓏼𝑺𝑼𝑷𝑳𝑬𝑵𝑻𝑬𝑺﹕ ${lista.suplentes.length}/2
${textoSup}
╰ ☆⃞ 　 ʾ 　 ๑
\`｡⁖. 𝑷𝒖𝒏𝒕𝒖𝒂𝒍𝒊𝒅𝒂𝒅 | 𝑺𝒊𝒏 𝒍𝒂𝒈 | 𝑹𝒆𝒔𝒑𝒆𝒕𝒐 ⁖｡\`

🎀 = Jugadora | 🌸 = Suplente | ❌ = Salir`

    await conn.sendMessage(m.chat, {
        text: texto,
        mentions: [...lista.titulares.map(v=>v.id),...lista.suplentes.map(v=>v.id)]
    })
}