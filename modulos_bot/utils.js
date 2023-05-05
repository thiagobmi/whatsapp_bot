import * as fs from 'fs';

export function timeConverter(UNIX_timestamp, showsec = false, showdate = false, onlydate = false) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = ''
    if (onlydate) {
        time += date + '/' + month + '/' + year + ' '
    }
    else {
        if (showdate == true) {
            time += date + '/' + month + '/' + year + ' '
        }
        time += hour + ':' + min;
        if (showsec == true) {
            time += ':' + sec;
        }
    }
    return time;
}

export async function mandaMensagemComandos(msg) {
    const mensagemComandos =
        `Comandos Atualizados 🤖:
\n*!meme:* envia um meme aleatório.
\n*!rmeme:* envia um meme aleatório em inglês.
\n*!g [texto]*: envia uma imagem do *google imagens* de acordo com o texto inserido
\n*!st*: pode ser usado como legenda de uma mídia ou como resposta a uma mensagem com mídia. Envia a mídia como figurinha.
\n*!st [texto]*: cria uma figurinha com o *texto* enviado.
\n_( *!st* tambem pode ser usado como resposta a uma mensagem de texto, para criar uma figurinha com o texto da mensagem que esta sendo respondida)_
\n*!r*: usado como resposta a uma figurinha ou imagem de visualização única. Reenvia a imagem da figurinha ou imagem de visualização única.
\n*!p*: envia um post aleatório do subreddit */r/brasil*
\n*!p [subreddit]*: envia um post aleatório do subreddit escolhido
\n*!c [lugar]:* envia informações sobre o *clima* do lugar requisitado.
_( *!clima [lugar]* também funciona!)_
\n*!gpt [pergunta]:* envia uma pergunta para a inteligência artificial OPENAI.
\n*!copy*:
\t*!copy [nome]*: manda a copypasta pelo nome.
\t*!copy list*: manda a lista de copypastas.
\t*!copy add [nome]*: usado como resposta a uma mensagem. Cria uma copypasta com o texto da mensagem respondida.
\t*!copy add [nome] [texto]*: cria uma copypasta com o nome e texto enviados.
\n*!stats*: envia as estatísticas do bot`

    msg.reply(mensagemComandos)

}

export async function logtext(text, erro = false) {

    let datetime = new Date();

    if (erro == false)
        fs.appendFileSync('log.txt', `${datetime.getDate()}/${datetime.getMonth()}/${datetime.getFullYear()} [${datetime.getHours()}:${datetime.getMinutes()}:${datetime.getSeconds()}]: ${text}\n`);
    else
        fs.appendFileSync('log.txt', `${datetime.getDate()}/${datetime.getMonth()}/${datetime.getFullYear()} [${datetime.getHours()}:${datetime.getMinutes()}:${datetime.getSeconds()}]: ${text} ${erro}\n`)
}

export async function logmessage(message) {

    let chat = await message.getChat();

    if ((message.author && message.fromMe) || !message.fromMe)
        if (chat.isGroup) {
            fs.appendFileSync('log.txt', `${timeConverter(message.timestamp, false, false, true)} [${timeConverter(message.timestamp, true)}] message in ${chat.name} from ${message._data.notifyName}: "${message.body}"\n`);
        }
        else {
            if (!message.fromMe && message._data.notifyName)
                fs.appendFileSync('log.txt', `${timeConverter(message.timestamp, false, false, true)} [${timeConverter(message.timestamp, true)}] message from  ${message._data.notifyName} to me: "${message.body}"\n`)
            else
                fs.appendFileSync('log.txt', `${timeConverter(message.timestamp, false, false, true)} [${timeConverter(message.timestamp, true)}] message from me to ${chat.name} : "${message.body}"\n`)
        }

}

export async function incrementaContador(nomeVariavel) {

    const filepathcount = './modulos_bot/contadores.json';
    const data = JSON.parse(fs.readFileSync(filepathcount));
    data[nomeVariavel]++
    fs.writeFileSync(filepathcount, JSON.stringify(data, null, 4));

}

export async function mandaStats(msg) {

    const filepathcount = './modulos_bot/contadores.json';
    const data = JSON.parse(fs.readFileSync(filepathcount));

    let msgStats = `O comando *!meme* foi usado ${data["numMemes"]} vezes
    \nO comando *!p* foi usado  ${data["numReddit"]} vezes
    \nO comando *!st* foi usado  ${data["numFigurinhas"]} vezes
    \nO comando *!clima* foi usado  ${data["numMemes"]} vezes
    \nO comando *!gpt* foi usado  ${data["numGPT"]} vezes
    \nO comando *!g* foi usado ${data["numPesquisas"]} vezes`
    msg.reply(msgStats)
    msg.react('✅')
}