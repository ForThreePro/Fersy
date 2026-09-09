import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'

global.owner = [
  [ '51927174369', 'Barboza OFC 🌃', true ],
  [ '573155227977', 'Jota 🐼', true ]
]

global.mods = []
global.prems = []

global.packname = `[ 𝙉𝙤𝙭 𝘽ο𝙩 🌃`
global.author = '𝙉𝙤𝙭 𝘽ο𝙩 𝙈𝘿 🌃]'
global.stickpack = '© 𝙉𝙤𝙭 𝘽ο𝙩 𝙈𝘿 🌃'
global.stickauth = '𝘽𝙮 𝙉𝙤𝙭 𝘽ο𝙩'
global.wm = '𝙉𝙤𝙭 🌃'
global.botname = '[ 𝙉𝙤𝙭 𝘽ο𝙩 𝙈𝘿 🌃 ]'
global.textbot = `𝙋ο𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝙉𝙤𝙭 🌀`
global.dev = '• 𝙋ο𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘾ο𝙢𝙪𝙣𝙞𝙩𝙮 𝙉𝙤𝙭 𝘽ο𝙩 𝙈𝘿 🌃'
global.wait = '🌪️ *𝘼𝙜𝙪𝙖𝙧𝙙𝙚 𝙪𝙣 𝙢ο𝙢𝙚𝙣𝙩ο, 𝙨ο𝙮 𝙡𝙚𝙣𝙩ο... ฅ^•ﻌ•^ฅ\n> 𝙉𝙤𝙭 𝘽ο𝙩 𝙈𝘿 🌃 🌪️*'
global.listo = '*𝘼𝙦𝙪𝙞 𝙩𝙞𝙚𝙣𝙚 ฅ^•ﻌ•^ฅ*'
global.namechannel = '𝙉𝙤𝙭 𝘽ο𝙩 𝙈𝘿 🌃'
global.channel = 'https://whatsapp.com/channel/0029Vaua0ZD3gvWjQaIpSy18'

global.catalogo = fs.readFileSync('./storage/img/catalogo.png')

// FOTO GLOBAL NUEVA 👇
global.botimg = 'https://files.evogb.win/QFXQtu.jpg'
if(fs.existsSync('./config.json')){
    let config = JSON.parse(fs.readFileSync('./config.json'))
    global.botimg = config.botimg || global.botimg
}

global.group = 'https://chat.whatsapp.com/CBuLXuVZcg9FEfCSHiY6b0'
global.canal = 'https://whatsapp.com/channel/0029Vaua0ZD3gvWjQaIpSy18'
global.insta = 'https://www.insta.com/sebastian_barboza13'

global.estilo = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
   ...(false? { remoteJid: "5219992095479-1625305606@g.us" } : {})
  },
  message: {
    orderMessage: {
      itemCount: -999,
      status: 1,
      surface: 1,
      message: global.packname,
      orderTitle: 'Bang',
      thumbnail: global.catalogo,
      sellerJid: '0@s.whatsapp.net'
    }
  }
}

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.jadi = 'Sesiones/Subbots'
global.Sesion = 'Sesiones/Principal'
global.dbname = 'database.json'

global.multiplier = 69
global.maxwarn = '2'

global.APIs = {... }
global.APIKeys = {... }

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})