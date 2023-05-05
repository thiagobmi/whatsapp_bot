export async function getAdmins(notification) {

    var admins = [];

    const data = await notification.getChat()
    for (let i = 0; i < data.participants.length; i++) {
        if (data.participants[i].isAdmin) {
            admins.push(data.participants[i].id._serialized);
        }
    }

    return admins;

}

export async function isFromAdmin(msg) {

    let isADM = false;
    const admins = await getAdmins(msg)
    for (let i = 0; i < admins.length; i++) {
        if (msg._data.id.participant == admins[i]) {
            isADM = true
        }
    }

    return isADM;
}
