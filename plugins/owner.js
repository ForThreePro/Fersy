import fs from 'fs'
import path from 'path'
import axios from 'axios'

let handler = async (m, { conn, args, command, text }) => {
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  // 1. OBTENER
  if (command === 'obtener') {
    if (!args[0]) {
      await react('❌')
      return m.reply(`𐔌 ꒱ ***ARCHIVOS*** 𐔌 ꒱ ⚠️\n\n── *📖 USO* ╏\n➛ obtener nombre.js\n━━━━━━━━━━━`)
    }

    let fileName = args[0].endsWith('.js')? args[0] : args[0] + '.js'
    let filePath = path.join('./plugins', fileName)

    if (!fs.existsSync(filePath)) {
      await react('❌')
      return m.reply(`𐔌 ꒱ ***ARCHIVOS*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ No encontré el archivo *${fileName}*\n━━━━━━━━━━━`)
    }

    try {
      let fileContent = fs.readFileSync(filePath, 'utf-8')

      if (fileContent.length > 3000) {
        await conn.sendMessage(m.chat, {
          document: Buffer.from(fileContent),
          mimetype: 'text/javascript',
          fileName: fileName,
          caption: `𐔌 ꒱ ***ARCHIVO ENVIADO*** 𐔌 ꒱ ✅\n\n── *📊 DATOS* ╏\n📁 ➛ Archivo: ${fileName}\n━━━━━━━━━━━`
        }, { quoted: m })
      } else {
        let msg = `𐔌 ꒱ ***${fileName.toUpperCase()}*** 𐔌 ꒱ 📄

.⃟𖥔 ݁. 𖦹˙— \`\`CONTENIDO\`\` —˙𖦹.📄꒷

\`\`javascript
${fileContent}
\`\`

━━━━━━━━━━━`
        await m.reply(msg)
      }
      await react('✅')
    } catch (e) {
      await react('❌')
      m.reply(`𐔌 ꒱ ***ARCHIVOS*** 𐔌 ꒱ ⚠️\n\n── *📝 ERROR* ╏\n❌ ➛ ${e.message}\n━━━━━━━━━━━`)
    }
  }

  // 2. EDIT
  if (command === 'edit') {
    if (!args[0] ||!text.includes('/')) {
      await react('❌')
      return m.reply(`𐔌 ꒱ ***ARCHIVOS*** 𐔌 ꒱ ⚠️\n\n── *📖 USO* ╏\n➛ edit nombre.js / texto nuevo\n━━━━━━━━━━━`)
    }

    let [fileName,...newText] = text.split('/')
    fileName = fileName.trim()
    newText = newText.join('/').trim()

    fileName = fileName.endsWith('.js')? fileName : fileName + '.js'
    let filePath = path.join('./plugins', fileName)

    try {
      fs.writeFileSync(filePath, newText, 'utf-8')
      let msg = `𐔌 ꒱ ***ARCHIVO EDITADO*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`EDITAR\`\` —˙𖦹.✏️꒷

── *📊 DATOS* ╏
📁 ➛ Archivo: ${fileName}
✅ ➛ Estado: Guardado correctamente

── *📝 NOTA* ╏
🔄 ➛ Reinicia el bot para aplicar cambios

━━━━━━━━━━━`
      await m.reply(msg)
      await react('✅')
    } catch (e) {
      await react('❌')
      m.reply(`𐔌 ꒱ ***ARCHIVOS*** 𐔌 ꒱ ⚠️\n\n── *📝 ERROR* ╏\n❌ ➛ ${e.message}\n━━━━━━━━━━━`)
    }
  }

  // 3. CREAR
  if (command === 'crear') {
    if (!args[0] ||!text.includes('/')) {
      await react('❌')
      return m.reply(`𐔌 ꒱ ***ARCHIVOS*** 𐔌 ꒱ ⚠️\n\n── *📖 USO* ╏\n➛ crear nombre.js / codigo del plugin\n━━━━━━━━━━━`)
    }

    let [fileName,...code] = text.split('/')
    fileName = fileName.trim()
    code = code.join('/').trim()

    fileName = fileName.endsWith('.js')? fileName : fileName + '.js'
    let filePath = path.join('./plugins', fileName)

    if (fs.existsSync(filePath)) {
      await react('❌')
      return m.reply(`𐔌 ꒱ ***ARCHIVOS*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ El archivo *${fileName}* ya existe\n💡 ➛ Usa edit para modificarlo\n━━━━━━━━━━━`)
    }

    try {
      fs.writeFileSync(filePath, code, 'utf-8')
      let msg = `𐔌 ꒱ ***ARCHIVO CREADO*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`CREAR\`\` —˙𖦹.📄꒷

── *📊 DATOS* ╏
📁 ➛ Archivo: ${fileName}
✅ ➛ Estado: Creado correctamente

── *📝 NOTA* ╏
🔄 ➛ Reinicia el bot para cargar el plugin

━━━━━━━━━━━`
      await m.reply(msg)
      await react('✅')
    } catch (e) {
      await react('❌')
      m.reply(`𐔌 ꒱ ***ARCHIVOS*** 𐔌 ꒱ ⚠️\n\n── *📝 ERROR* ╏\n❌ ➛ ${e.message}\n━━━━━━━━━━━`)
    }
  }

  // 4. DEL
  if (command === 'del') {
    if (!args[0]) {
      await react('❌')
      return m.reply(`𐔌 ꒱ ***ARCHIVOS*** 𐔌 ꒱ ⚠️\n\n── *📖 USO* ╏\n➛ del nombre.js\n━━━━━━━━━━━`)
    }

    let fileName = args[0].endsWith('.js')? args[0] : args[0] + '.js'
    let filePath = path.join('./plugins', fileName)

    if (!fs.existsSync(filePath)) {
      await react('❌')
      return m.reply(`𐔌 ꒱ ***ARCHIVOS*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ No encontré el archivo *${fileName}*\n━━━━━━━━━━━`)
    }

    try {
      fs.unlinkSync(filePath)
      let msg = `𐔌 ꒱ ***ARCHIVO ELIMINADO*** 𐔌 ꒱ 🗑️

.⃟𖥔 ݁. 𖦹˙— \`\`ELIMINAR\`\` —˙𖦹.🗑️꒷

── *📊 DATOS* ╏
📁 ➛ Archivo: ${fileName}
✅ ➛ Estado: Eliminado correctamente

━━━━━━━━━━━`
      await m.reply(msg)
      await react('🗑️')
    } catch (e) {
      await react('❌')
      m.reply(`𐔌 ꒱ ***ARCHIVOS*** 𐔌 ꒱ ⚠️\n\n── *📝 ERROR* ╏\n❌ ➛ ${e.message}\n━━━━━━━━━━━`)
    }
  }

  // 5. VER1
  if (command === 'ver1') {
    try {
      await react('⏳')
      const repo = 'ForThreePro/Teste2' // TU REPO
      const branch = 'main'
      const url = `https://api.github.com/repos/${repo}/contents/plugins?ref=${branch}`

      const { data } = await axios.get(url)
      let jsFiles = data.filter(f => f.name.endsWith('.js')).map((f, i) => `│ ${i+1}. ${f.name}`).join('\n')

      let msg = `𐔌 ꒱ ***LISTA GITHUB*** 𐔌 ꒱ 📋

.⃟𖥔 ݁. 𖦹˙— \`\`PLUGINS\`\` —˙𖦹.📋꒷

── *📊 ARCHIVOS* ╏
${jsFiles || '│ No hay archivos.js'}

── *📝 INFO* ╏
📦 ➛ Total: ${jsFiles? jsFiles.split('\n').length : 0} archivos
🔗 ➛ Repo: ${repo}

━━━━━━━━━━━`
      await m.reply(msg)
      await react('✅')
    } catch (e) {
      await react('❌')
      m.reply(`𐔌 ꒱ ***ARCHIVOS*** 𐔌 ꒱ ⚠️\n\n── *📝 ERROR* ╏\n❌ ➛ ${e.message}\n💡 ➛ Verifica que el repo sea público\n━━━━━━━━━━━`)
    }
  }
}

handler.help = ['obtener <archivo>', 'edit <archivo> / <texto>', 'crear <archivo> / <codigo>', 'del <archivo>', 'ver1']
handler.tags = ['tools']
handler.command = ['obtener', 'edit', 'crear', 'del', 'ver1']

export default handler