const DC = require('discord.js'),
    CFG = require('./config.json'),
    HLP = require('./helper');
const _helper = (message, command, cl) => {
    const _lang = command.name == 'ajuda' ? 'pt' : 'en',
        sender = message.member;
    if (command.args.length == 0) {
        let embed = new DC.RichEmbed()
            .setTitle(HLP._t('helpertitle', _lang))
            .setColor('ff9900')
            .setThumbnail(cl.user.displayAvatarURL)
            .setDescription(HLP._t('helperdesc', _lang,
                `${command.prefix}${command.name}`,
                '1.8+',
                CFG.serversite,
                CFG.serverip,
                CFG.serversite + '/rules'
            ));
        message.reply(HLP._t('helpermessage', _lang), embed);
    } else if (command.args[0] == 'comandos' || command.args[0] == 'commands') {
        let embed = new DC.RichEmbed()
            .setTitle(HLP._t('commandslisttitle', _lang))
            .setColor('ff9900')
            .setDescription(HLP._t('commandslistdesc', _lang, ...CFG.commands.map((v) => {
                if (v == 'help') {
                    v = command.name;
                }
                return CFG.prefix + v;
            })));
        if (sender && (sender.hasPermission('BAN_MEMBERS') || sender.hasPermission('MUTE_MEMBERS') || sender.hasPermission('KICK_MEMBERS'))) {
            let embd = new DC.RichEmbed()
                .setTitle(HLP._t('admincommandslisttitle', _lang))
                .setColor('ff9900')
                .setDescription(HLP._t('admincommandslistdesc', _lang,
                    `${CFG.prefix}${_lang == 'pt' ? 'banir' : 'ban'}`,
                    `${CFG.prefix}${_lang == 'pt' ? 'silenciar' : 'mute'}`,
                    `${CFG.prefix}${_lang == 'pt' ? 'expulsar' : 'kick'}`
                ));
            sender.createDM().then((dm) => {
                dm.send(embd);
            });
        }
        message.reply(HLP._t('commandslistmessage', _lang), embed);
    } else {
        message.reply(HLP._t('commandnotfound', _lang, command.prefix + command.name + command.args.join(' ')));
    }
},
_punish = (message, command, type, lang) => {
    const sender = message.member,
        user = message.mentions.users.first(),
        reason = command.args[1] ? command.args.splice(1).join(' ') : HLP._t('noreason', lang);
    if (!sender) {
        return;
    }
    if (
        (type == 'ban' && !sender.hasPermission('BAN_MEMBERS')) ||
        (type == 'kick' && !sender.hasPermission('KICK_MEMBERS')) ||
        (type == 'mute' && !sender.hasPermission('MUTE_MEMBERS'))
    ) {
        sender.createDM().then((dm) => {
            dm.send(HLP._t('nopermission', lang));
        });
        return;
    }
    if (user) {
        const member = message.guild.member(user);
        if (member) {
            if (type == 'ban') {
                member.ban({
                    reason: reason
                }).then(() => {
                    sender.createDM().then((dm) => { dm.send(HLP._t('userpunished', lang, user.tag)); });
                    member.createDM().then((dm) => { dm.send(HLP._t('userbanned', lang, sender.user.tag, reason)); });
                });
            } else if (type == 'kick') {
                member.kick(reason).then(() => {
                    sender.createDM().then((dm) => { dm.send(HLP._t('userpunished', lang, user.tag)); });
                    member.createDM().then((dm) => { dm.send(HLP._t('userckicked', lang, sender.user.tag, reason)); });
                });
            } else if (type == 'mute') {
                if (member.mute) {
                    sender.createDM().then((dm) => { dm.send(HLP._t('memberalreadymuted', lang, user.tag)); });
                    return;
                }
                member.setMute(true, reason).then(() => {
                    sender.createDM().then((dm) => { dm.send(HLP._t('userpunished', lang, user.tag)); });
                    member.createDM().then((dm) => { dm.send(HLP._t('usermuted', lang, sender.user.tag, reason)); });
                });
            }
        } else {
            sender.createDM().then((dm) => {
                dm.send(HLP._t('usernotinguild', lang, user.tag));
            });
        }
    } else {
        sender.createDM().then((dm) => {
            let args = [
                '<@User>',
                '[Reason]'
            ];
            if (lang == 'pt') {
                args = [
                    '<@Usuário>',
                    '[Motivo]'
                ];
            }
            dm.send(HLP._t('commandusage', lang, `${command.prefix}${command.name} ${args.join(' ')}`));
        });
    }
};
module.exports = {
    "ip": (message, command) => {
        message.reply(CFG.serverip);
    },
    "site": (message, command) => {
        message.reply(CFG.serversite);
    },
    "ajuda": _helper,
    "help": _helper,
    "ban": (m, c) => { _punish(m, c, 'ban', 'en'); },
    "banir": (m, c) => { _punish(m, c, 'ban', 'pt'); },
    "kick": (m, c) => { _punish(m, c, 'kick', 'en'); },
    "expulsar": (m, c) => { _punish(m, c, 'kick', 'pt'); },
    "mute": (m, c) => { _punish(m, c, 'mute', 'en'); },
    "silenciar": (m, c) => { _punish(m, c, 'mute', 'pt'); },
}