let handler = async (m, { conn, command }) => {

global.db = global.db || {}
global.db.listas = global.db.listas || {}

let idLista = `vs16_${m.chat}`
let args = m.text.split(' ')[1] //.tit.sup.out

// Si no hay lista, la crea
if(!global.db.listas[idLista]){
    global.db.listas[idLista] = {
        titulares: [],
        suplentes: [],
        maxTit: 4,
        maxSup: 2
    }
}

let lista = global.db.listas[idLista]
let user = m.sender
let name = await conn.getName(user)

// SISTEMA DE ANOTACION
if(args){
    // Quitar de ambas
    lista.titulares = lista.titulares.filter(v => v.id!== user)
    lista.suplentes = lista.suplentes.filter(v => v.id!== user)

    if(args === 'tit'){
        if(lista.titulares.length < lista.maxTit){
            lista.titulares.push({id: user, name})
            await m.reply(`🎀 @${user.split('@')[0]} se anotó como TITULAR`, { mentions: [user] })
        } else {
            return m.reply(`⚠️ Ya hay 4 titulares. Usa.sup para suplente`)
        }
    }

    if(args === 'sup'){
        if(lista.suplentes.length < lista.maxSup){
            lista.suplentes.push({id: user, name})
            await m.reply(`🌸 @${user.split('@')[0]} se anotó como SUPLENTE`, { mentions: [user] })
        } else {
            return m.reply(`⚠️ Ya hay 2 suplentes`)
        }
    }

    if(args === 'out'){
        await m.reply(`❌ @${user.split('@')[0]} salió de la lista`, { mentions: [user] })
    }
}

// ACTUALIZAR LISTA
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

*COMO ANOTARSE:*
🎀.tit vs16 = Jugadora
🌸.sup vs16 = Suplente
❌.out vs16 = Salir`

await conn.sendMessage(m.chat, {
    text: texto,
    mentions: [...lista.titulares.map(v=>v.id),...lista.suplentes.map(v=>v.id)]
}, { quoted: m })

}

handler.help = ['vs16']
handler.tags = ['ff']
handler.command = /^vs16$/i
export default handler