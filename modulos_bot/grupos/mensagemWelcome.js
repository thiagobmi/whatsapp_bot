import * as fs from 'fs';
import { getAdmins,isFromAdmin } from './getAdmins.js';

export async function mandaMensagemWelcome(msg) {
    const chat = await msg.getChat()
    if (chat.isGroup) {
        if (existeMensagemWelcome(msg._data.id.remote)) {
            const data = fs.readFileSync(`./modulos_bot/grupos/welcome_messages/${msg._data.id.remote}.txt`);
            msg.reply(data.toString());
        }
        else {
            msg.reply('🤖 Esse grupo não possui mensagem de boas vindas.')
        }
    }
}

export async function mudaMensagemWelcome(msg, novaMensagem) {

    const chat = await msg.getChat()
    const existeMsg = existeMensagemWelcome(msg._data.id.remote)

    if (chat.isGroup) {
        const doADM = await isFromAdmin(msg)
        if (doADM || msg.fromMe) {
            if (existeMsg) {
                fs.writeFileSync(`./modulos_bot/grupos/welcome_messages/${msg._data.id.remote}.txt`, novaMensagem);
                msg.reply('🤖 A mensagem de boas vindas foi alterada. digite *!w* para ver.')
            }
            else {
                fs.writeFileSync(`./modulos_bot/grupos/welcome_messages/${msg._data.id.remote}.txt`, novaMensagem);
                const data = fs.readFileSync('./modulos_bot/grupos/welcome_messages.json')
                const json = JSON.parse(data)
                json.push(msg._data.id.remote);
                fs.writeFileSync("./modulos_bot/grupos/welcome_messages.json", JSON.stringify(json));
                msg.reply('🤖 Uma nova mensagem de boas vindas foi adicionada. digite *!w* para ver.')
            }
        }
        else {
            msg.reply('🤖 Somente admins podem alterar a mensagem de boas vindas.')
        }
    }
}

export async function entrouNoGrupo(notification) {

    const idGrupo = notification.chatId;

    if (existeMensagemWelcome(idGrupo)) {

        var novaMensagem = fs.readFileSync(`./modulos_bot/grupos/welcome_messages/${idGrupo}.txt`).toString();

        if (novaMensagem.includes('$marcação')) {

            const chat = await notification.getRecipients();
            const index = novaMensagem.indexOf('$');
            novaMensagem = novaMensagem.replace('$marcação', '')
            const parte1 = novaMensagem.slice(0, index)
            const parte2 = novaMensagem.replace(parte1, '');
            for (let i = 0; i < chat.length; i++) {
                const mensagemFinal = parte1 + `@${chat[i].number} ` + parte2
                notification.reply(mensagemFinal, { mentions: [chat[i]] });
            }
        }
        else {
            notification.reply(novaMensagem);
        }
    }

}

export function existeMensagemWelcome(groupid) {

    var messageExists

    const data = fs.readFileSync('./modulos_bot/grupos/welcome_messages.json')
    const json = JSON.parse(data)

    messageExists = json.filter(item => item == groupid).length > 0;

    if (messageExists) {
        return true;
    }

    else {
        return false;
    }


}

export async function removeMensagemWelcome(msg) {

    const chat = await msg.getChat()
    const existeMsg = existeMensagemWelcome(msg._data.id.remote)

    if (chat.isGroup) {
        const doADM = await isFromAdmin(msg)
        if (doADM || msg.fromMe) {
            if (existeMsg) {
                const data = fs.readFileSync('./modulos_bot/grupos/welcome_messages.json')
                var json = JSON.parse(data)
                json=json.filter(item => item !== msg._data.id.remote)
                fs.writeFileSync("./modulos_bot/grupos/welcome_messages.json", JSON.stringify(json));
                fs.unlinkSync(`./modulos_bot/grupos/welcome_messages/${msg._data.id.remote}.txt`);
                msg.reply('🤖 A mensagem de boas vindas foi removida.')
            }
            else {
                msg.reply('🤖 Esse grupo não possui mensagem de boas vindas. digite *!w change [mensagem]* para adicionar uma.')
            }
        }
        else {
            msg.reply('🤖 Somente admins podem alterar a mensagem de boas vindas.')
        }
    }
}