const DC = require('discord.js'),
    CL = new DC.Client(),
    CFG = require('./config.json'),
    HLP = require('./helper'),
    CMDS = require('./commands');
CL.on('ready', () => {
    CL.user.setActivity(`Minecraft at ${CFG.serverip}`, {
        type: 'PLAYING'
    });
    CL.on('message', (message) => {
        const cmd = HLP.checkCommand(message),
            user = message.member;
        if (cmd) {
            if (message.deletable) {
                message.delete();
            }
            if (CMDS[cmd.name]) {
                CMDS[cmd.name](message, cmd, CL);
            } else {
                message.reply(HLP._t('commandnotfound', null, cmd.prefix + cmd.command + cmd.args.join(' ')));
            }
            return;
        }
        HLP.checkMessageLinks(message);
    })
    .on('messageUpdate', (oldmessage, newmessage) => {
        HLP.checkMessageLinks(newmessage);
    });
});

CL.login(CFG.token);