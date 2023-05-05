import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;
import { client } from '../../server.js';
import { logtext } from '../utils.js';


export async function mandaPostReddit(msg, subReddit = 'brasil') {
    try {
        await
            fetch(`https://meme-api.com/gimme/${subReddit}`)
                .then(res => res.json())
                .then(async json => {
                    const ImageUrl = json.url
                    msg.react('🤖')
                    const memeImg = await MessageMedia.fromUrl(ImageUrl);
                    client.sendMessage(msg.id.remote, memeImg, { caption: `from /r/${json.subreddit}: ${json.title}` }).then(() => {
                        logtext('[mandapostreddit]: post sent!')
                    }).catch(error => logtext('[mandapostreddit]: error: ', error));

                }).catch((error) => logtext('[mandapostreddit]: error: ', error))
    }
    catch (error) {
        logtext('[mandapostreddit]: error: ', error)
    }
}


export async function mandaMemeGringo(msg) {
    try {
        await
            fetch(`https://meme-api.com/gimme`)
                .then(res => res.json())
                .then(async json => {
                    const ImageUrl = json.url
                    msg.react('🥸')
                    const memeImg = await MessageMedia.fromUrl(ImageUrl);
                    msg.reply(memeImg).then(() => {
                        logtext(`[mandamemegringo]: meme sent! `)
                    }).catch(error => logtext('[mandamemegringo]: error: ', error)
                    );
                }).catch((error) => logtext('[mandamemegringo]: error: ', error))
    }
    catch (error) {
        logtext('[mandamemegringo]: error: ', error)
    }
}


export async function mandaMeme(msg) {
    const subReddits = ["DiretoDoZapZap", "HUEstation", "AgiotasClub", "eu_nvr"];
    const random = subReddits[Math.floor(Math.random() * subReddits.length)];
    try {
        await
            fetch(`https://meme-api.com/gimme/${random}`)
                .then(res => res.json())
                .then(async json => {
                    const ImageUrl = json.url
                    msg.react('🥸')
                    const memeImg = await MessageMedia.fromUrl(ImageUrl);
                    msg.reply(memeImg).then(() => {
                        logtext(`[mandameme]: meme from ${random} sent! `)
                    }).catch(error => logtext('[mandameme]: error: ', error));

                }).catch((error) => logtext('[mandameme]: error: ', error))
    }
    catch (error) {
        logtext('[mandameme]: error: ', error)
    }
}
