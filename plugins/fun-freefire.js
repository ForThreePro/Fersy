let handler = async (m, { conn, command }) => {

global.db = global.db || {}
global.db.listas = global.db.listas || {}

let idLista = `vs16_${m.chat}`

// Reinicia la lista
global.db.listas[idLista] = {
    titulares: [],
    suplentes: [],
    maxTit: 4,
    maxSup: 2
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
\`｡⁖. 𝑷𝒖𝒏𝒕𝒖𝒂𝒍𝒊𝒅𝒂𝒅 | 𝑺𝒊𝒏 𝒍𝒂𝒈 | 𝑹𝒆𝒔𝒑𝒆𝒕𝒐 ⁖｡\``

let buttons = [
    { buttonId: `tit_${idLista}`, buttonText: { displayText: '🎀 Jugadora' }, type: 1 },
    { buttonId: `sup_${idLista}`, buttonText: { displayText: '🌸 Suplente' }, type: 1 },
    { buttonId: `out_${idLista}`, buttonText: { displayText: '❌ Salir' }, type: 1 }
]

await conn.sendMessage(m.chat, {
    text: lista,
    footer: 'Toca para anotarte al vs16',
    buttons: buttons,
    headerType: 1
}, { quoted: m })

}

handler.help = ['vs16']
handler.tags = ['ff']
handler.command = /^vs16$/i
export default handler

// ===== ARREGLADO: LEE BOTONES =====
export async function before(m, { conn }) {
    let id = ''
    
    // Para detectar los 2 tipos de botones
    if (m.message?.buttonsResponseMessage) {
        id = m.message.buttonsResponseMessage.selectedButtonId
    } else if (m.message?.templateButtonReplyMessage) {
        id = m.message.templateButtonReplyMessage.selectedId
    }
    
    if(!id) return
    if(!id.startsWith('tit_') && !id.startsWith('sup_') && !id.startsWith('out_')) return
    
    let user = m.sender
    let name = await conn.getName(user)
    let idLista = id.split('_').slice(1).join('_')
    let lista = global.db?.listas?.[idLista]
    
    if(!lista) return conn.reply(m.chat, '⚠️ Esta lista ya expiró. Manda .vs16 de nuevo', m)

    // Quitar de ambas listas primero
    lista.titulares = lista.titulares.filter(v => v.id !== user)
    lista.suplentes = lista.suplentes.filter(v => v.id !== user)

    if(id.startsWith('tit_')){
        if(lista.titulares.length < lista.maxTit){
            lista.titulares.push({id: user, name})
            await conn.reply(m.chat, `🎀 @${user.split('@')[0]} se anotó como TITULAR`, m, { mentions: [user] })
        } else {
            await conn.reply(m.chat, `⚠️ Ya hay 4 titulares. Usa 🌸 Suplente`, m)
        }
    }
    
    if(id.startsWith('sup_')){
        if(lista.suplentes.length < lista.maxSup){
            lista.suplentes.push({id: user, name})
            await conn.reply(m.chat, `🌸 @${user.split('@')[0]} se anotó como SUPLENTE`, m, { mentions: [user] })
        } else {
            await conn.reply(m.chat, `⚠️ Ya hay 2 suplentes`, m)
        }
    }
    
    if(id.startsWith('out_')){
        await conn.reply(m.chat, `❌ @${user.split('@')[0]} salió de la lista`, m, { mentions: [user] })
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
\`｡⁖. 𝑷𝒖𝒏𝒕𝒖𝒂𝒍𝒊𝒅𝒂𝒅 | 𝑺𝒊𝒏 𝒍𝒂𝒈 | 𝑹𝒆𝒔𝒑𝒆𝒕𝒐 ⁖｡\``

    let buttons = [
        { buttonId: `tit_${idLista}`, buttonText: { displayText: '🎀 Jugadora' }, type: 1 },
        { buttonId: `sup_${idLista}`, buttonText: { displayText: '🌸 Suplente' }, type: 1 },
        { buttonId: `out_${idLista}`, buttonText: { displayText: '❌ Salir' }, type: 1 }
    ]

    await conn.sendMessage(m.chat, {
        text: texto,
        footer: 'Toca para anotarte al vs16',
        buttons: buttons,
        headerType: 1,
        mentions: [...lista.titulares.map(v=>v.id),...lista.suplentes.map(v=>v.id)]
    })
}