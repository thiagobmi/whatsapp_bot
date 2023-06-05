import * as fs from 'fs';
import { logmessage, logtext } from '../utils.js';

export async function listaExiste(msg) {
    const idLista = msg._data.author
    const data = fs.readFileSync('./modulos_bot/to_do_list/listas.json')
    const json = JSON.parse(data);
    let messageExists = json.filter(item => item == idLista).length > 0;

    if (messageExists) {
        return true;
    }
    else {
        return false;
    }

}

export async function mandaTDlist(msg) {
    let exists = await listaExiste(msg);
    if (!exists) {
        logtext('[sendtodolist]: requester don\'t have to-do list!');
        msg.reply('🤖 Você não possui uma to-do list.');
        return;
    }
    else {
        let mensagem = '*----🗒️Lista de Tarefas🗒️----*\n';
        let data = fs.readFileSync(`./modulos_bot/to_do_list/listas/${msg._data.author}.json`);
        if (msg.fromMe) {
            data = fs.readFileSync(`./modulos_bot/to_do_list/listas/me.json`);
        }
        const json = JSON.parse(data);
        for (let i = 0; i < json.length; i++) {

            if (json[i]["check"] == true) {
                mensagem += `\n${i + 1} ✅ : ~${json[i]["nome"]}~`
            }
            else {
                mensagem += `\n${i + 1} 🟩 : ${json[i]["nome"]}`
            }
        }

        logtext('[sendtodolist]: to-do list sent!');
        msg.reply(mensagem);
    }

}

export async function removeTarefa(msg, index) {
    var exists = await listaExiste(msg);

    if (isNaN(index)) {
        msg.react('❌')
        return;
    }

    if (!exists) {
        logtext('[removetarefa]: requester don\'t have to-do list!');
        msg.reply('🤖 Você não possui uma to-do list.');
        return;
    }
    else {
        let data = fs.readFileSync(`./modulos_bot/to_do_list/listas/${msg._data.author}.json`);
        if (msg.fromMe) {
            data = fs.readFileSync(`./modulos_bot/to_do_list/listas/me.json`);
        }
        const json = JSON.parse(data);
        if (index - 1 > json.length || json.length == 0) {
            logtext('[removetarefa]: task requested don\'t exist!');
            msg.reply('🤖 Essa tarefa não existe.');
            return;
        }
        json.splice(index - 1, 1);
        if (msg.fromMe) {
            fs.writeFileSync(`./modulos_bot/to_do_list/listas/me.json`, JSON.stringify(json));
        } else {
            fs.writeFileSync(`./modulos_bot/to_do_list/listas/${msg._data.author}.json`, JSON.stringify(json));
        }
        logtext('[removetarefa]: task removed from to-do list!');
    }

}

export async function checkTarefa(msg, index) {
    var exists = await listaExiste(msg);

    if (isNaN(index)) {
        msg.react('❌')
        return;
    }

    if (!exists) {
        logtext('[checktarefa]: requester don\'t have to-do list!');
        msg.reply('🤖 Você não possui uma to-do list.');
        return;
    }
    else {
        let data = fs.readFileSync(`./modulos_bot/to_do_list/listas/${msg._data.author}.json`);
        if (msg.fromMe) {
            data = fs.readFileSync(`./modulos_bot/to_do_list/listas/me.json`);
        }
        const json = JSON.parse(data);
        if (index - 1 >= json.length) {
            logtext('[checktarefa]: requested task don\'t exist!');
            msg.reply('🤖 Essa tarefa não existe.');
            return;
        }
        json[index - 1]["check"] = true;
        if (msg.fromMe) {
            fs.writeFileSync(`./modulos_bot/to_do_list/listas/me.json`, JSON.stringify(json));
        } else {
            fs.writeFileSync(`./modulos_bot/to_do_list/listas/${msg._data.author}.json`, JSON.stringify(json));
        }
        logtext('[checktarefa]: task marked as done!');
    }

}

export async function criaLista(msg) {
    var exists = await listaExiste(msg);
    if (!exists) {
        const data = fs.readFileSync('./modulos_bot/to_do_list/listas.json')
        const json = JSON.parse(data);
        json.push(msg._data.author);
        fs.writeFileSync("./modulos_bot/to_do_list/listas.json", JSON.stringify(json));
        logtext(`[crialista]: new to-do list created for : ${msg._data.author}`);
    }
    if (msg.fromMe) {
        fs.writeFileSync(`./modulos_bot/to_do_list/listas/me.json`, JSON.stringify(json));
    } else {
        logtext(`[crialista]: new to-do list created for : ${msg._data.author}`);
        fs.writeFileSync(`./modulos_bot/to_do_list/listas/${msg._data.author}.json`, '[]');
    }


    msg.reply('🤖 Nova lista foi criada.');

}

export async function adicionaTarefa(msg, tarefa) {
    let exists = await listaExiste(msg);
    if (!exists) {
        await criaLista(msg);
        logtext(`[adicionatarefa]: new to-do list created for : ${msg._data.author}`);
    }

    let data = fs.readFileSync(`./modulos_bot/to_do_list/listas/${msg._data.author}.json`);
    if (msg.fromMe) {
        data = fs.readFileSync(`./modulos_bot/to_do_list/listas/me.json`);
    }
    const json = JSON.parse(data);
    var novaTarefa = {}
    novaTarefa.nome = tarefa;
    novaTarefa.check = false;
    json.push(novaTarefa);
    if (msg.fromMe) {
        fs.writeFileSync(`./modulos_bot/to_do_list/listas/me.json`, JSON.stringify(json));
    } else {
        fs.writeFileSync(`./modulos_bot/to_do_list/listas/${msg._data.author}.json`, JSON.stringify(json));
    }
    logtext(`[adicionatarefa]: new task added!`);
    msg.react('✅');

}
