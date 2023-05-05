import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;
import { logtext } from '../utils.js';

import { GOOGLE_API_KEYS } from "../API_KEYS.js";

export async function ImageGoogle(msg, input, numero) {

    var guardanumero

    const keys = GOOGLE_API_KEYS

    guardanumero = (numero % 11);

    var API_KEY = keys[guardanumero]
    var CX = '703a886e938804c4d'

    try {
        await fetch(`https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${input}&searchType=image&fileType=jpg&alt=json&num=1`).then(res => res.json())
            .then(async json => {

                if (!json.items[0].link) {
                    logtext(`[imagegoogle]: error: json file is null. key used: ${guardanumero}`)
                    msg.react('❗')
                    msg.reply('🤖 Erro, tente novamente')
                }
                msg.react('🤖')
                const msgImg = await MessageMedia.fromUrl(json.items[0].link, { unsafeMime: true })
                msg.reply(msgImg).then(() => {
                    logtext(`[imagegoogle]: image sent! input: ${input} `)
                }).catch(error => logtext('[imagegoogle]: error: ', error));
            })
    }
    catch (error) {
        logtext('[imagegoogle]: error: ', error)
        msg.react('❗')
        msg.reply('🤖 Erro, tente novamente')
    }
}
