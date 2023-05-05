
import pkg from 'whatsapp-web.js';
const { Client, Location, List, Buttons, LocalAuth, MessageMedia } = pkg;
import { client } from '../../server.js';
import { logtext } from '../utils.js';

import { OPENAI_API_KEY } from "../API_KEYS.js"

export async function SendQuestion(input, msg) {
    var sQuestion = input
    msg.react('🤖')
    try {
        await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + OPENAI_API_KEY,
            },
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: sQuestion,
                max_tokens: 2048, // tamanho da resposta
                temperature: 0.25, // criatividade na resposta
            }),
        })
            .then((response) => response.json())
            .then((json) => {
                if (json.error?.message) {
                    console.log(json.error?.message)
                    logtext(`[questiongpt]: error: `, json.error?.message)


                } else if (json.choices?.[0].text) {
                    let mensagem = '\nChat GPT:' + (json.choices[0].text || "Sem resposta")

                    msg.reply(mensagem).then(() => {
                        logtext('[questiongpt]: message sent!')
                    }).catch(error => logtext(`[questiongpt]: error: `, error)
                    );
                }
            })
            .catch((error) => logtext(`[questiongpt]: error: `, error)
            )
    }
    catch (error) {
        logtext(`[questiongpt]: error: `, error)
    }
}
