let Keywords = {
    STREET: ['ул.','пр.','пл.','Ул.'],
    GOVERMENT: ['ГУ', 'РГУ'],
    BUSINES: ['АО','ТОО','ИП']
}
let Token = {
    LITERAL:           0,
    ORGANIZATION_NAME: 1,
    STREET_NUMBER:     2,
    STREET_NAME:       3,
    PHONE:             4,
    URL:               5,
    EMAIL:             6,
}
let TokenRules = {
    [Token.LITERAL]: /(^[A-ZА-Я][а-яa-zё][a-zа-яё \-\.\,\/А-Я]+[0-9]{0,4})[\ ,]/,
    [Token.ORGANIZATION_NAME]: /^[A-ZА-Я0-9#№,\.\-\)\(— ]+\n$/,
    [Token.STREET_NUMBER]: /,[  ]?(\d+[\.\/A-Za-zА-Яа-я ]*)/,
    [Token.STREET_NAME]: RegExp('^('+Keywords.STREET.join('|')+') ?([А-Яа-я "\'`«»]+),'),
    [Token.PHONE]: /[7-8]{1}\d{10}|\+7\d{10}|\d{6}|(8?\(7152\))?\d{2}[- ]\d{2}[- ]\d{2}|8[- ]?7152[ -]+\d{3}[ -]+\d{3}|8\(\d+\)\d+/g, // 8(71538)22148
    [Token.URL]: /([a-zA-Z0-9\-]*\.)+[a-zA-Z0-9]{2,4}(\/[a-zA-Z0-9=.?&-]*)?/g,
    [Token.EMAIL]: /[a-zA-Zа-яА-ЯёЁ0-9.\-_]+@[a-zA-Zа-яА-ЯёЁ0-9][a-zA-Zа-яА-ЯёЁ0-9\.\-_]+[a-zA-Z]{2,4}\.[\w-]{2,4}/g,
    [Token.TEXT]: ''
}
module.exports = {Keywords, Token, TokenRules}
