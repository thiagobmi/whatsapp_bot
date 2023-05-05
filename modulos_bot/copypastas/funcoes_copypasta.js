import * as fs from 'fs';
import { logmessage, logtext } from '../utils.js';
import { error, log } from 'console';

export async function addCopypasta(msg, nomeCopypasta, textoCopypasta) {

    var copypastaExists

    fs.readFile('./media/copypastas.json', function (err, data) {
        const json = JSON.parse(data)

        copypastaExists = json.filter(item => item == nomeCopypasta).length > 0;

        if (copypastaExists) {
            msg.reply(`🤖 Já existe uma copypasta com o nome ${nomeCopypasta}`)
            return;
        }

        else {
            json.push(nomeCopypasta)
            fs.writeFileSync("./media/copypastas.json", JSON.stringify(json))
            logtext(`[addcopypasta]: copypasta ${nomeCopypasta} added.`)
            msg.reply(`🤖 Copypasta "${nomeCopypasta}" adicionada com sucesso. Digite *!copy ${nomeCopypasta}* para o bot enviá-la.`);
        }
        if (err) {
            logtext(`[addcopypasta]: error: `, err)
        }
    })


    if (!copypastaExists) {
        const mediaPath = './media/copypastas/';
        const extension = 'txt';
        const filename = nomeCopypasta
        const fullFilename = mediaPath + filename + '.' + extension;
        console.log(fullFilename)
        try {
            fs.writeFileSync(fullFilename, textoCopypasta);

        } catch (err) {
            logtext(`[addcopypasta]: error: `, err)
            console.log('Failed to save the file:', err);

        }
    }
}


export async function listaCopypasta(msg) {

    let mensagem = '🤖 *Lista de copypastas:*\n'
    fs.readFile('./media/copypastas.json', function (err, data) {

        const json = JSON.parse(data)

        for (let i = 0; i < json.length; i++) {
            mensagem += `\n${i + 1} - ${json[i]}`
        }

        mensagem += '\n\nDigite *!copy [nome-da-copypasta]* para receber a copypasta'
        msg.reply(mensagem)

        if (err) {
            logtext(`[listaCopypasta]: erro: `, err)
        }
        else{
            logtext('[listacopypasta]: copypasta list sent!: ');
        }
    })
}

export async function mandaCopypasyata(msg, nomeCopypasta) {

    let flag = false;
    const data = fs.readFileSync('./media/copypastas.json')
    const json = JSON.parse(data)
    for (let i = 0; i < json.length; i++) {
        if (nomeCopypasta == json[i]) {
            const textomsg = fs.readFileSync(`./media/copypastas/${nomeCopypasta}.txt`)
            msg.reply(textomsg.toString());
            logtext(`[mandacopypasta]: copypasta ${nomeCopypasta} sent!`)
            flag = true
        }
    }
    if (!flag)
        msg.reply('🤖Copypasta nao encontrada.');

}