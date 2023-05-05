import * as fs from 'fs';
import * as mime from 'mime-types'
import { createCanvas } from 'canvas';
import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;
import { logmessage, logtext } from '../utils.js';
import { client } from '../../server.js';

export async function sendSticker(msg) {
    try {
        await msg.downloadMedia().then(media => {
            if (media) {
                const mediaPath = './media/downloaded-media';
                if (!fs.existsSync(mediaPath)) {
                    fs.mkdirSync(mediaPath);
                }
                const extension = mime.extension(media.mimetype);

                const filename = new Date().getTime();
                msg.react('👍');
                const fullFilename = mediaPath + filename + '.' + extension;
                // Save to file
                try {
                    fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                    client.sendMessage(msg.id.remote, new MessageMedia(media.mimetype, media.data, filename), { sendMediaAsSticker: true, stickerAuthor: "Bot criado por: @thiagobmi_", stickerName: `Figurinha feita por ${msg._data.notifyName}` }).then(() => {
                        logtext('[sendsticker]: sticker sent!');
                    }).catch(error => {
                        logtext('[sendsticker]: error: ', error)
                        msg.reply('🤖 Ih, deu erro. Provavelmente a mídia é muito grande ou não é compatível')
                    }
                    );
                    fs.unlinkSync(fullFilename)
                } catch (err) {
                    logtext('[sendsticker]: error when saving file: ', err);
                }
            }
        });
    }
    catch (error) {
        logtext('[sendsticker]: error: ', error);
        return
    }
}

export async function sendStickerQuoted(msg) {
    const quotedMsg = await msg.getQuotedMessage();
    if (quotedMsg.hasMedia) {
        try {
            await
                quotedMsg.downloadMedia().then(media => {
                    if (media) {
                        msg.react('👍');
                        const mediaPath = './media/downloaded-media';
                        const extension = mime.extension(media.mimetype);
                        const filename = new Date().getTime();
                        const fullFilename = mediaPath + filename + '.' + extension;
                        // Save to file
                        try {
                            fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                            client.sendMessage(msg.id.remote, new MessageMedia(media.mimetype, media.data, filename), { sendMediaAsSticker: true, stickerAuthor: "Bot criado por: @thiagobmi_", stickerName: `Figurinha feita por ${msg._data.notifyName}` }).then(() => {
                                logtext('[sendstickerquoted]: sticker sent!');
                            }).catch(error => {
                                logtext('[sendstickerquoted]: error: ', error)

                                msg.reply('🤖 Ih, deu erro. Provavelmente a mídia é muito grande ou não é compatível')
                            }
                            );
                            fs.unlinkSync(fullFilename)
                        } catch (err) {
                            logtext('[sendstickerquoted]: error when saving file: ', err);
                        }
                    }
                });
        }
        catch (error) {
            logtext('[sendstickerquoted]: error: ', error);
            return
        }
    }
}

export async function sendImageQuoted(msg) {
    const quotedMsg = await msg.getQuotedMessage();
    if (quotedMsg.hasMedia) {
        try {
            await
                quotedMsg.downloadMedia().then(media => {
                    if (media) {
                        msg.react('👍');
                        const mediaPath = './media/downloaded-media';
                        const extension = mime.extension(media.mimetype);
                        const filename = new Date().getTime();
                        const fullFilename = mediaPath + filename + '.' + extension;
                        // Save to file
                        try {
                            fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                            client.sendMessage(msg.id.remote, new MessageMedia(media.mimetype, media.data, filename)).then(() => {
                                logtext('[sendimagequoted]: media sent!')
                            }).catch(error => {
                                logtext('[sendimagequoted]: error: ', error)
                                msg.reply('🤖 Ih, deu erro. Provavelmente a mídia é muito grande ou não é compatível')
                            }
                            );

                            fs.unlinkSync(fullFilename)
                        } catch (err) {
                            logtext('[sendimagequoted]: error when saving file: ', err);
                        }
                    }
                });
        }
        catch (error) {
            logtext('[sendimagequoted]: error: ', error);
            return
        }
    }
}

export function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    context.textAlign = 'center'
    context.fillStyle = '#ffffff'
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x * 4, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x * 4, y);
}


export async function MandaFigurinhaTexto(msg, texto) {

    const width = 700
    const height = 700
    const canvas = createCanvas(width, height)
    var context = canvas.getContext('2d');
    var maxWidth = width - 50;
    var lineHeight = 77;
    var x = (canvas.width - maxWidth) / 2;
    var y = 82;
    //var text = 'All the world\'s a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.';
    var text = texto.replaceAll('\n', ' ')


    context.font = 'bold 64pt Menlo';
    context.fillStyle = '#333';

    wrapText(context, text, 64 + x, y + 150, maxWidth, lineHeight);

    const imgBuffer = canvas.toBuffer('image/png')
    fs.writeFileSync('./media/downloaded-media/drawnImage.png', imgBuffer, { encoding: 'base64' })
    msg.react('👍');
    const media = MessageMedia.fromFilePath('./media/downloaded-media/drawnImage.png')
    client.sendMessage(msg.id.remote, media, { sendMediaAsSticker: true, stickerAuthor: "Bot criado por: @thiagobmi_", stickerName: `Figurinha feita por ${msg._data.notifyName}` }).then(() => {
        logtext('[mandafigurinhatexto]: sticker sent!');
    }).catch(error => logtext('[mandafigurinhatexto]: error: ', error));

    fs.unlinkSync('./media/downloaded-media/drawnImage.png')

}

