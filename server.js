import pkg from "whatsapp-web.js";
const { Client, Location, List, Buttons, LocalAuth, MessageMedia } = pkg;
import * as fs from "fs";
import {
  mandaMeme,
  mandaMemeGringo,
  mandaPostReddit,
} from "./modulos_bot/internet_images/memes.js";
import { ImageGoogle } from "./modulos_bot/internet_images/google_images.js";
import { SendQuestion } from "./modulos_bot/internet_text/questionGPT.js";
import { getDataClima } from "./modulos_bot/internet_text/clima.js";
import {
  sendSticker,
  sendImageQuoted,
  sendStickerQuoted,
  MandaFigurinhaTexto,
} from "./modulos_bot/figurinhas/figurinhas.js";
import {
  addCopypasta,
  listaCopypasta,
  mandaCopypasyata,
} from "./modulos_bot/copypastas/funcoes_copypasta.js";
import {
  mandaMensagemWelcome,
  mudaMensagemWelcome,
  entrouNoGrupo,
  removeMensagemWelcome,
} from "./modulos_bot/grupos/mensagemWelcome.js";
import {
  incrementaContador,
  mandaMensagemComandos,
  mandaStats,
  timeConverter,
} from "./modulos_bot/utils.js";
import { getAdmins, isFromAdmin } from "./modulos_bot/grupos/getAdmins.js";
import {
  mandaTDlist,
  listaExiste,
  removeTarefa,
  checkTarefa,
  criaLista,
  adicionaTarefa,
} from "./modulos_bot/to_do_list/todolist.js";
import { logmessage, logtext } from "./modulos_bot/utils.js";
import { randomInt } from "crypto";
import m from "gm";

var logmessages = false;

export const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: "/usr/bin/google-chrome-stable",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  },
});

client.initialize();

client.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, message);
});

client.on("qr", (qr) => {
  // NOTE: This event will not be fired if a session is specified.
  console.log("QR RECEIVED", qr);
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", () => {
  console.log("READY");
  logtext(`Client started!`);
});

async function printaMensagem(message) {
  let chat = await message.getChat();
  if (chat.isGroup) {
    console.log(
      `[${timeConverter(message.timestamp, true)}]`,
      "message",
      "in",
      chat.name,
      "from",
      `${message._data.notifyName}:`,
      `${message.body}`
    );
  } else {
    console.log(
      `[${timeConverter(message.timestamp, true)}]`,
      "message from",
      `${message._data.notifyName}:`,
      `"${message.body}"`
    );
  }
}

async function grupoTemTS(msg) {
  const idGrupo = msg._data.id.remote;
  const data = fs.readFileSync("./tasklists/lists.json");
  const json = JSON.parse(data);
  let messageExists = json.filter((item) => item.grupo == idGrupo).length > 0;

  if (messageExists) {
    return true;
  } else {
    return false;
  }
}

async function tsExiste(msg, nome) {
  const idGrupo = msg._data.id.remote;
  const data = fs.readFileSync("./tasklists/lists.json");
  const json = JSON.parse(data);
  let array = json.filter((item) => item.grupo == msg._data.id.remote)[0]
    .listas;

  let exists = array.filter((item) => item.nome == nome).length > 0;

  return exists;
}

async function newTaskList(msg, nome) {
  let exists = await grupoTemTS(msg);
  if (!exists) {
    const data = fs.readFileSync("./tasklists/lists.json");
    const json = JSON.parse(data);
    let dict = {};
    dict["grupo"] = msg._data.id.remote;
    dict["listas"] = [{ nome: nome, inuse: true }];
    json.push(dict);
    fs.writeFileSync("./tasklists/lists.json", JSON.stringify(json));
    fs.mkdirSync(`./tasklists/${msg._data.id.remote}`);
    fs.writeFileSync(`./tasklists/${msg._data.id.remote}/${nome}.json`, "[]");
    msg.react("✅");
    msg.reply(`🤖 A Task List ${nome} foi criada com sucesso.`);
  } else {
    let tsexiste = await tsExiste(msg, nome);
    if (!tsexiste) {
      const data = fs.readFileSync("./tasklists/lists.json");
      const json = JSON.parse(data);

      let saveindex = 0;
      for (let i = 0; i < json.length; i++)
        if (json[i].grupo == msg._data.id.remote) saveindex = i;

      let obj = { nome: nome, inuse: true };
      for (let i = 0; i < json[saveindex].listas.length; i++)
        json[saveindex].listas[i].inuse = false;

      json[saveindex].listas.push(obj);
      fs.writeFileSync("./tasklists/lists.json", JSON.stringify(json));
      fs.writeFileSync(`./tasklists/${msg._data.id.remote}/${nome}.json`, "[]");
      msg.react("✅");
      msg.reply(`🤖 A Task List ${nome} foi criada com sucesso.`);
    } else {
    }
  }
}

async function getNomeTsEmUso(msg) {
  let temTS = await grupoTemTS(msg);

  if (temTS) {
    const data = fs.readFileSync("./tasklists/lists.json");
    const json = JSON.parse(data);

    let saveindex = 0;

    for (let i = 0; i < json.length; i++)
      if (json[i].grupo == msg._data.id.remote) {
        saveindex = i;
      }

    for (let i = 0; i < json[saveindex].listas.length; i++)
      if (json[saveindex].listas[i].inuse == true)
        return json[saveindex].listas[i].nome;
  }
  return false;
}

async function addTasktoList(msg, tarefa) {
  let temTS = await grupoTemTS(msg);

  if (temTS) {
    let tsEmUso = await getNomeTsEmUso(msg);
    if (!tsEmUso) {
      msg.react("❌");
      msg.reply("🤖Esse grupo não possui nenhuma Task List em uso.");
      return;
    }

    let data = fs.readFileSync(
      `./tasklists/${msg._data.id.remote}/${tsEmUso}.json`
    );
    const json = JSON.parse(data);
    var novaTarefa = {};
    novaTarefa.nome = tarefa;
    novaTarefa.check = false;
    json.push(novaTarefa);
    fs.writeFileSync(
      `./tasklists/${msg._data.id.remote}/${tsEmUso}.json`,
      JSON.stringify(json)
    );
    msg.react("✅");
    return
  }
  msg.react("❌");
  msg.reply(
    "🤖 Esse grupo não possui nenhuma Task List. Escreva *!ts new [nome]* para criar uma nova."
  );
}
async function checkTask(msg, index) {
  let tsEmUso = await getNomeTsEmUso(msg);
  if (isNaN(index)) {
    msg.react("❌");
    return;
  }
  if (!tsEmUso) {
    msg.react("❌");
    msg.reply("🤖Esse grupo não possui nenhuma Task List em uso.");
    return;
  }

  let data = fs.readFileSync(
    `./tasklists/${msg._data.id.remote}/${tsEmUso}.json`
  );
  const json = JSON.parse(data);
  if (index - 1 >= json.length) {
    msg.reply("🤖 Essa tarefa não existe.");
    return;
  }
  json[index - 1]["check"] = true;

  fs.writeFileSync(
    `./tasklists/${msg._data.id.remote}/${tsEmUso}.json`,
    JSON.stringify(json)
  );
  msg.react("✅");
}

async function uncheckTask(msg, index) {
  let tsEmUso = await getNomeTsEmUso(msg);

  if (!tsEmUso) {
    msg.react("❌");
    msg.reply("🤖Esse grupo não possui nenhuma Task List em uso.");
    return;
  }
  if (isNaN(index)) {
    msg.react("❌");
    return;
  }

  let data = fs.readFileSync(
    `./tasklists/${msg._data.id.remote}/${tsEmUso}.json`
  );
  const json = JSON.parse(data);
  if (index - 1 >= json.length) {
    msg.reply("🤖 Essa tarefa não existe.");
    return;
  }
  json[index - 1]["check"] = false;

  fs.writeFileSync(
    `./tasklists/${msg._data.id.remote}/${tsEmUso}.json`,
    JSON.stringify(json)
  );
  msg.react("✅");
}

async function removeTask(msg, index) {
  let tsEmUso = await getNomeTsEmUso(msg);

  if (!tsEmUso) return;

  if (isNaN(index)) {
    msg.react("❌");
    return;
  }

  let data = fs.readFileSync(
    `./tasklists/${msg._data.id.remote}/${tsEmUso}.json`
  );

  const json = JSON.parse(data);

  if (index > json.length || json.length == 0) {
    msg.reply("🤖 Essa tarefa não existe.");
    return;
  }

  json.splice(index - 1, 1);

  fs.writeFileSync(
    `./tasklists/${msg._data.id.remote}/${tsEmUso}.json`,
    JSON.stringify(json)
  );
  msg.react("✅");
}

async function mandaTaskList(msg) {
  let temTS = await grupoTemTS(msg);
  if (temTS) {
    let tsEmUso = await getNomeTsEmUso(msg);
    if (!tsEmUso) return;

    msg.react("✅");
    let mensagem = `\t*${tsEmUso}*\n`;
    let data = fs.readFileSync(
      `./tasklists/${msg._data.id.remote}/${tsEmUso}.json`
    );
    const json = JSON.parse(data);
    for (let i = 0; i < json.length; i++) {
      if (json[i]["check"] == true) {
        mensagem += `\n${i + 1} ✅ : ~${json[i]["nome"]}~`;
      } else {
        mensagem += `\n${i + 1} 🟩 : ${json[i]["nome"]}`;
      }
    }
    msg.reply(mensagem);
    msg.react("✅");
    return
  }
  msg.react("❌");
  msg.reply(
    "🤖 Esse grupo não possui nenhuma Task List. Escreva *!ts new [nome]* para criar uma nova."
  );
}

async function mandaTodasTaskLists(msg) {
  let temTS = await grupoTemTS(msg);

  if (!temTS) {
    msg.react("❌");
    msg.reply(
      "🤖 Esse grupo não possui nenhuma Task List. Escreva *!ts new [nome]* para criar uma nova."
    );
    return;
  }
  msg.react("✅");

  const data = fs.readFileSync("./tasklists/lists.json");
  const json = JSON.parse(data);

  let listas = json.filter((item) => item.grupo == msg._data.id.remote)[0]
    .listas;

  let mensagem = "\t*Task Lists desse grupo*\n\t(✅ indica a lista em uso)\n\n";

  for (let i = 0; i < listas.length; i++) {
    if (listas[i]["inuse"] == true) {
      mensagem += `\n*[${i + 1}] ${listas[i]["nome"]}* ✅\n`;
    } else {
      mensagem += `\n*[${i + 1}] ${listas[i]["nome"]}*\n`;
    }
  }
  msg.reply(mensagem);
  msg.react("✅");
}

async function setTsInUse(msg, index) {
  let exists = await grupoTemTS(msg);

  if (!exists) {
    msg.react("❌");
    msg.reply(
      "🤖 Esse grupo não possui nenhuma Task List. Escreva *!ts new [nome]* para criar uma nova."
    );
    return;
  }
  if (isNaN(index)) {
    msg.react("❌");
    return;
  }

  const data = fs.readFileSync("./tasklists/lists.json");
  const json = JSON.parse(data);

  let saveindex = 0;

  for (let i = 0; i < json.length; i++)
    if (json[i].grupo == msg._data.id.remote) {
      saveindex = i;
    }

  if (
    index - 1 >= json[saveindex].listas.length ||
    json[saveindex].listas.length == 0
  ) {
    msg.reply("🤖 Essa lista não existe.");
    return;
  }

  for (let i = 0; i < json[saveindex].listas.length; i++)
    json[saveindex].listas[i].inuse = false;

  json[saveindex].listas[index - 1].inuse = true;
  fs.writeFileSync("./tasklists/lists.json", JSON.stringify(json));
  msg.reply(
    `🤖 Lista em uso trocada para [${index}] ${
      json[saveindex].listas[index - 1].nome
    }`
  );
  msg.react("✅");
}

async function removeTaskList(msg, index) {
  let exists = await grupoTemTS(msg);
  if (!exists) {
    msg.react("❌");
    msg.reply(
      "🤖 Esse grupo não possui nenhuma Task List. Escreva *!ts new [nome]* para criar uma nova."
    );
    return;
  }

  if (isNaN(index)) {
    msg.react("❌");
    return;
  }

  const data = fs.readFileSync("./tasklists/lists.json");
  const json = JSON.parse(data);

  let saveindex = 0;

  for (let i = 0; i < json.length; i++)
    if (json[i].grupo == msg._data.id.remote) {
      saveindex = i;
    }

  if (
    index - 1 >= json[saveindex].listas.length ||
    json[saveindex].listas.length == 0
  ) {
    msg.reply("🤖 Essa lista não existe.");
    return;
  }

  let savenome = json[saveindex].listas[index - 1].nome;
  let saveuse = json[saveindex].listas[index - 1].inuse;
  json[saveindex].listas.splice(index - 1, 1);

  fs.writeFileSync("./tasklists/lists.json", JSON.stringify(json));
  fs.unlinkSync(`./tasklists/${msg._data.id.remote}/${savenome}.json`);

  if (json[saveindex].listas.length > 0 && saveuse == true) {
    json[saveindex].listas[0].inuse = true;
    fs.writeFileSync("./tasklists/lists.json", JSON.stringify(json));
  }

  msg.reply(`🤖 Lista ${index} foi removida.`);
  msg.react("✅");
}

client.on("message_create", async (msg) => {
  const filepathcount = "./modulos_bot/contadores.json";
  const data = JSON.parse(fs.readFileSync(filepathcount));

  //printaMensagem(msg)

  if (logmessages) logmessage(msg);

  // if (msg.author && msg.fromMe == false && msg._data.id.remote == '556592944119-1545329417@g.us' && (msg.author.startsWith('5511945131383') || msg.author.startsWith('554196824427') || msg.author.startsWith('556584492879') || msg.author.startsWith('556584712362') || msg.author.startsWith('556593385349') || msg.author.startsWith('556596013128'))) {
  //     msg.react('🏳‍🌈')
  //     return
  //  }

  if (msg.body == "!ping") {
    msg.react("✅");
  } else if (msg.body === "!groupinfo") {
    let chat = await msg.getChat();
    if (chat.isGroup) {
      msg.reply(`
                *Group Details*
                Name: ${chat.name}
                Description: ${chat.description}
                Created At: ${chat.createdAt.toString()}
                Created By: ${chat.owner.user}
                Participant count: ${chat.participants.length}
            `);
    } else {
      msg.reply("This command can only be used in a group!");
    }
  } else if (msg.body == "!st") {
    if (msg.fromMe == false) {
      incrementaContador("numFigurinhas");
    }
    if (msg.hasMedia) {
      sendSticker(msg);
    }
    if (msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage();
      if (quotedMsg.hasMedia) {
        sendStickerQuoted(msg);
      } else if (quotedMsg != "" && quotedMsg.hasMedia == false) {
        MandaFigurinhaTexto(msg, quotedMsg.body);
      }
    } else if (msg.hasQuotedMsg == false && msg.hasMedia == false) {
      msg.reply(
        "🤖 Use *!st* seguido por um texto (para fazer figurinha do texto), em uma mensagem com mídia ou como resposta a uma mensagem com mídia!"
      );
    }
  } else if (msg.body.startsWith("!st ") && msg.body != "!st ") {
    const texto = msg.body.replace("!st ", "");
    MandaFigurinhaTexto(msg, texto);
    if (msg.fromMe == false) {
      incrementaContador("numFigurinhas");
    }
  } else if (msg.body.startsWith("!clima ")) {
    let lugar = msg.body.replace("!clima ", "");
    getDataClima(lugar, msg);
    if (msg.fromMe == false) {
      incrementaContador("numClima");
    }
  } else if (msg.body.startsWith("!c ")) {
    let lugar = msg.body.replace("!c ", "");
    getDataClima(lugar, msg);
    if (msg.fromMe == false) {
      incrementaContador("numClima");
    }
  } else if (msg.body.startsWith("!horario")) {
    const media = MessageMedia.fromFilePath(
      "./media/downloaded-media/horarios.png"
    );
    msg
      .reply(media)
      .then(() => {})
      .catch((error) => console.error("Error when sending message", error));
  } else if (msg.body.startsWith("!gpt")) {
    const pergunta = msg.body.replace("!gpt ", "");
    SendQuestion(pergunta, msg);
    if (msg.fromMe == false) {
      incrementaContador("numGPT");
    }
  } else if (msg.body.startsWith("!meme")) {
    mandaMeme(msg);
    if (msg.fromMe == false) {
      incrementaContador("numMemes");
    }
  } else if (msg.body.startsWith("!rmeme")) {
    mandaMemeGringo(msg);
    if (msg.fromMe == false) {
      incrementaContador("numMemes");
    }
  } else if (msg.body == "!off" && msg.fromMe) {
    await msg.react("✅");
    let datetime = new Date();
    logtext(`Client destroy!`);
    client.destroy();
  } else if (msg.body.startsWith("!p") && msg.body != "!ping") {
    if (msg.fromMe == false) {
      incrementaContador("numReddit");
    }
    if (msg.body == "!p") mandaPostReddit(msg);
    else {
      const nomeSubreddit = msg.body.replace("!p ", "");
      mandaPostReddit(msg, nomeSubreddit);
    }
  } else if (msg.body.startsWith("!g ")) {
    if (msg.fromMe == false) {
      incrementaContador("numPesquisas");
    }
    const nomeImagem = msg.body.replace("!g ", "");
    ImageGoogle(msg, nomeImagem, data["numPesquisas"]);
  } else if (msg.body == "!comandos" || msg.body == "!help") {
    mandaMensagemComandos(msg);
  } else if (msg.body == "!stats") {
    mandaStats(msg);
  } else if (msg.body == "!r") {
    if (msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage();
      if (quotedMsg.hasMedia && (!quotedMsg.fromMe || msg.fromMe)) {
        sendImageQuoted(msg);
      }
    } else {
      msg.reply(
        "🤖 *!r* deve ser usado como resposta a uma figurinha ou imagem de visualização única. Reenvia a imagem da figurinha ou imagem de visualização única."
      );
    }
  } else if (msg.body.startsWith("!copy ") && !msg.hasMedia) {
    let comando_copy = msg.body.replace("!copy ", "");
    if (comando_copy.startsWith("add ")) {
      if (msg.body == "!copy add" && msg.hasQuotedMsg) {
        msg.reply("🤖 Erro. Faltou dar um nome à sua copypasta.");
        return;
      }

      let nomeCopypasta = msg.body.replace("!copy add ", "");

      if (nomeCopypasta.includes(" ") && !msg.hasQuotedMsg) {
        nomeCopypasta = nomeCopypasta
          .slice(0, nomeCopypasta.indexOf(" "))
          .replace(" ", "");
      } else if (!msg.hasQuotedMsg) {
        console.log(nomeCopypasta);
        msg.reply(
          "🤖 Erro ao adicionar copypasta. Além do nome, deve colocar o texto da copypasta, ou responder com o comando à mensagem com o texto que deseja."
        );
        return;
      }

      console.log(nomeCopypasta);

      if (["add", "search", "list"].includes(nomeCopypasta)) {
        msg.reply("🤖Erro! Esse nome não é permitido");
        return;
      }

      let textoCopypasta = msg.body
        .replace("!copy add ", "")
        .replace(nomeCopypasta, "");
      if (textoCopypasta == "") {
        if (msg.hasQuotedMsg) {
          const quotedMsg = await msg.getQuotedMessage();
          if (!quotedMsg.hasMedia) {
            msg.react("👍");
            addCopypasta(msg, nomeCopypasta, quotedMsg.body);
          }
        } else {
          msg.reply("🤖 chapou");
        }
      } else if (!msg.hasMedia) {
        msg.react("👍");
        addCopypasta(msg, nomeCopypasta, textoCopypasta);
      }
    } else if (comando_copy == "list") {
      msg.react("👍");
      listaCopypasta(msg);
    } else {
      msg.react("👍");
      mandaCopypasyata(msg, comando_copy);
    }
  } else if (msg.body.startsWith("!w") && !msg.hasMedia) {
    const comando = msg.body.replace("!w", "");
    if (comando == "") {
      mandaMensagemWelcome(msg);
    } else if (comando.startsWith(" change")) {
      const novaMsgWelcome = msg.body.replace("!w change ", "");
      mudaMensagemWelcome(msg, novaMsgWelcome);
    } else if (comando == " remove") {
      removeMensagemWelcome(msg);
    }
  } else if (msg.body.startsWith("!td") && !msg.hasMedia) {
    const comando = msg.body.replace("!td", "");
    if (comando == "") {
      mandaTDlist(msg);
    } else if (comando == " new") {
      criaLista(msg);
    } else if (comando.startsWith(" add ")) {
      const novaTarefa = comando.replace(" add ", "");
      if (novaTarefa == "") {
        msg.react("❌");
      } else {
        adicionaTarefa(msg, novaTarefa);
      }
    } else if (comando.startsWith(" c")) {
      const index = comando.replace(" c ", "");
      if (msg.body == "!td c") {
        checkTarefa(msg, 1);
        msg.react("✅");
      } else if (!isNaN(index)) {
        checkTarefa(msg, index);
        msg.react("✅");
      } else {
        msg.react("❌");
      }
    } else if (comando.startsWith(" rm ")) {
      const index = comando.replace(" rm ", "");
      if (!isNaN(index)) {
        removeTarefa(msg, index);
        msg.react("✅");
      } else {
        msg.react("❌");
      }
    }
  } else if (msg.body.startsWith("!all")) {
    let mensagem = msg.body.replace("!all", "");
    const chat = await msg.getChat();

    if (!chat.isGroup) {
      msg.react("❌");
    } else {
      let ehADM = await isFromAdmin(msg);
      if (!ehADM && !msg.fromMe) {
        msg.react("❌");
      } else {
        msg.react("✅");

        let text = "";
        let mentions = [];

        for (let participant of chat.participants) {
          const contact = await client.getContactById(
            participant.id._serialized
          );
          mentions.push(contact);
          text = `*@all*`;
        }

        text += mensagem;
        await chat.sendMessage(text, { mentions });
      }
    }
  } else if (msg.body == "!logoff" && msg.fromMe) {
    logtext(`[logmessages]: off`);
    msg.react("❌");
    logmessages = false;
  } else if (msg.body == "!log" && msg.fromMe) {
    logtext(`[logmessages]: on`);
    msg.react("✅");
    logmessages = true;
  } else if (msg.body == "!logstatus") {
    if (logmessages) {
      msg.react("✅");
    } else {
      msg.react("❌");
    }
  } else if (msg.body.startsWith("!ts")) {
    let chat = await msg.getChat();
    if (chat.isGroup) {
      if (msg.body == "!ts") {
        mandaTaskList(msg);
      } else if (msg.body.startsWith("!ts add ") && msg.body != "!ts add ") {
        let tarefa = msg.body.replace("!ts add ", "");
        addTasktoList(msg, tarefa);
      } else if (msg.body.startsWith("!ts new ")) {
        let nome = msg.body.replace("!ts new ", "");
        newTaskList(msg, nome);
      } else if (msg.body.startsWith("!ts c ")) {
        let index = msg.body.replace("!ts c ", "");
        checkTask(msg, index);
      } else if (msg.body.startsWith("!ts u ")) {
        let index = msg.body.replace("!ts u ", "");
        uncheckTask(msg, index);
      } else if (msg.body.startsWith("!ts rm ")) {
        let index = msg.body.replace("!ts rm ", "");
        removeTask(msg, index);
      } else if (msg.body == "!ts ls") {
        mandaTodasTaskLists(msg);
      } else if (msg.body.startsWith("!ts set ") && msg.body != "!ts set ") {
        let index = msg.body.replace("!ts set ", "");
        setTsInUse(msg, index);
      } else if (
        msg.body.startsWith("!ts rlist ") &&
        msg.body != "!ts rlist "
      ) {
        let index = msg.body.replace("!ts rlist ", "");
        removeTaskList(msg, index);
      }
    } else {
      msg.react("❌");
    }
  } else if (msg.body.startsWith("!roll")) {
    if (msg.body == "!roll") {
      const rndInt = Math.floor(Math.random() * 6) + 1;
      msg.reply(`🎲 Você rolou ${rndInt}.`);
    } else {
      let numero = msg.body.replace("!roll ", "");
      if (!isNaN(numero)) {
        const rndInt = Math.floor(Math.random() * numero) + 1;
        msg.reply(`🎲 Você rolou ${rndInt}.`);
      } else {
        msg.react("❌");
      }
    }
  }

  // if (msg.author) {
  //     if (msg.author.startsWith('553499396169')) {
  //         msg.react('🏳‍🌈')
  //     }
  // }
});

client.on("message_revoke_everyone", async (after, before) => {
  // Fired whenever a message is deleted by anyone (including you)
  //console.log('mensagem deletada'); // message after it was deleted.
  if (before) {
    //console.log(before); // message before it was deleted.
  }
});

client.on("message_revoke_me", async (msg) => {
  // Fired whenever a message is only deleted in your own view.
  //if (!msg.fromMe) {
  //    logtext(`[messagedeleted]:`)
  //    logmessage(msg);
  //}
  // message before it was deleted.
});

client.on("message_ack", (msg, ack) => {
  /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

  if (ack == 3) {
    // The message was read
  }
});

client.on("group_join", (notification) => {
  // User has joined or been added to the group.
  entrouNoGrupo(notification);
  //console.log('join', notification);
  //notification.reply('User joined.');
});

client.on("group_leave", (notification) => {
  // User has left or been kicked from the group.
  //console.log('leave', notification);
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});
