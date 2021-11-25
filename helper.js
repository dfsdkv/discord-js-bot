const CFG = require('./config.json'),
    LANGPT = require('./lang/pt'),
    LANGEN = require('./lang/en');
module.exports = class Helper {
    static checkMessageLinks (message) {
        if (!message.member || Helper.checkBadMessage(message)) {
            return;
        }
        if (!message.member.user.bot && message.channel.type != 'dm') {
            let msg = message.content,
                matchurl = msg.toLowerCase().match(new RegExp(CFG.regex.url, 'i'));
            if (matchurl) {
                if (!matchurl.groups.url.match(new RegExp(CFG.regex.site, 'i'))) {
                    if (message.deletable) {
                        message.delete();
                    }
                }
            }
        }
    }
    static checkBadMessage (message) {
        let msg = message.content.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s*/g, '');
        if (msg.match(new RegExp(`(${CFG.badwords.join('|')})`, 'gi'))) {
            if (message.deletable) {
                message.delete();
            }
            return true;
        }
        return false;
    }
    static checkCommand (message) {
        let msg = message.content.replace(/\s+/g, ' ').trim();
        if (msg.substring(0, 1) == CFG.prefix) {
            msg = msg.substring(1).trim();
            let args = msg.split(' ');
            if (args.length > 0 && args[0].length > 0) {
                return {
                    prefix: CFG.prefix,
                    name: args[0].replace(/\W/g, '').toLowerCase(),
                    args: args.splice(1)
                };
            }
        }
        return false;
    }
    static _t (key, lang, ...args) {
        const format = (str, ...args) => {
            for (let i = 0; i < args.length; i++) {
                str = str.replace(`%s${i + 1}`, args[i]);
            }
            return str;
        };
        let str = '';
        if (!lang || lang == 'pt') {
            // str = format(LANGEN[key] || '', ...args);
            str = format(LANGPT[key] || '', ...args);
        } else {
            str = format(LANGEN[key] || '', ...args);
        }
        return str.replace(/%s[\d]+/g, '');
    }
}