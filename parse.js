const fs = require('fs')

    let State = {
        INSIDE:  0,
        OUTSIDE: 1
    };
    let Keywords = {
        STREET: ['ул.','пр.','пл.','Ул.'],
        GOVERMENT: ['ГУ', 'РГУ'],
        BUSINES: ['АО','ТОО','ИП']
    };
    let Token = {
        LITERAL:       0,
        ORGANIZATION_NAME: 1,
        STREET_NUMBER: 2,
        STREET_NAME:   3,
        PHONE:         4,
        URL:           5,
        EMAIL:         6,
    };
    let TokenRules = {
        [Token.LITERAL]: /(^[A-ZА-Я][а-яa-zё][a-zа-яё \-\.\,\/А-Я]+[0-9]{0,4})[\ ,]/,
        [Token.ORGANIZATION_NAME]: /^[A-ZА-Я0-9#№,\.\-\)\(— ]+\n$/,
        [Token.STREET_NUMBER]: /,[  ]?(\d+[\.\/A-Za-zА-Яа-я ]*)/,
        [Token.STREET_NAME]: RegExp('^('+Keywords.STREET.join('|')+') ?([А-Яа-я "\'`«»]+),'),
        [Token.PHONE]: /[7-8]{1}\d{10}|\+7\d{10}|\d{6}|(8?\(7152\))?\d{2}[- ]\d{2}[- ]\d{2}|8[- ]?7152[ -]+\d{3}[ -]+\d{3}|8\(\d+\)\d+/g, // 8(71538)22148
        [Token.URL]: /([a-zA-Z0-9\-]*\.)+[a-zA-Z0-9]{2,4}(\/[a-zA-Z0-9=.?&-]*)?/g,
        [Token.EMAIL]: /[a-zA-Zа-яА-ЯёЁ0-9.\-_]+@[a-zA-Zа-яА-ЯёЁ0-9][a-zA-Zа-яА-ЯёЁ0-9\.\-_]+[a-zA-Z]{2,4}\.[\w-]{2,4}/g,
        [Token.TEXT]: ''
    };
    
    class Lexem {
        constructor(token, value, line){
            this._token = token
            this._value = value
            this._line = line
        }
        get value(){
            return this._value
        }
        get type(){
            return this._type
        }
    }

    class Lexer {

        constructor(text){
            this._lexems = []
            this._text = text
        }

        run(){
            let state = State.OUTSIDE
            let curLex = -1
            let word   = ''
            let line   = 0
            for(let i  = 0; i < this._text.length; ++i){
                let ch = this._text[i];

                if(ch === '\n') line++;
                if( state === State.OUTSIDE ){
                    if( /[A-Za-z0-9А-Яа-я]/.test(ch) ){
                        state = State.INSIDE
                        word = ch
                    }
                } else {
                    word += ch
                    if( '\n' === ch ){
                        state = State.OUTSIDE

                        if( TokenRules[Token.STREET_NAME].test(word) ){
                            let street = word.match( TokenRules[Token.STREET_NAME] )[2]
                            let streetNumber = word.match( TokenRules[Token.STREET_NUMBER] )
                            
                            this._lexems.push( new Lexem(Token.STREET_NAME, street, line) )
                            if( streetNumber ){
                                streetNumber = streetNumber[1]
                                streetNumber = streetNumber.trim()
                                this._lexems.push( new Lexem(Token.STREET_NUMBER, streetNumber, line) )
                            }
                        } else if( TokenRules[Token.ORGANIZATION_NAME].test(word) ) {
                            word = word.replace('\n','')
                            this._lexems.push( new Lexem(Token.ORGANIZATION_NAME, word, line) )
                            continue
                        } else if( TokenRules[Token.LITERAL].test(word) ){
                            let division = word.match(TokenRules[Token.LITERAL])
                            if( division ){
                                division = division[1]
                                division = division.replace(' факс ', '')
                                division = division.replace(/,$/,'')
                                division = division.trim()
                                this._lexems.push( new Lexem(Token.LITERAL, division, line) )
                            }
                        }

                        if( TokenRules[Token.PHONE].test(word) ) {
                            let phones = word.match( TokenRules[Token.PHONE] )
                            phones.forEach((item)=>{
                                this._lexems.push( new Lexem(Token.PHONE, item, line) )
                            })
                        }
                        let word_copy_without_emails = word;
                        if( TokenRules[Token.EMAIL].test(word) ){
                            let emails = word.match( TokenRules[Token.EMAIL] )
                            emails.forEach((item)=>{
                                word_copy_without_emails = word_copy_without_emails.replace(item,'')
                                this._lexems.push( new Lexem(Token.EMAIL, item, line) )
                            })
                        }
                        if( TokenRules[Token.URL].test(word_copy_without_emails) ){
                            let urls = word_copy_without_emails.match( TokenRules[Token.URL] )
                            if( urls ){                        
                                urls.forEach((item)=>{
                                    this._lexems.push( new Lexem(Token.URL, item, line) )
                                })
                            }
                        }

                    }
                }
            }
        }

        lexems(){
            return this._lexems
        }
    }

fs.readFile('bd.txt', 'utf8', function(err, data){
    if( err ) throw err;

    let lexer = new Lexer(data);
    lexer.run()
    console.log( lexer.lexems() );
    //console.log( lexer.lexems().filter((item)=>{return item._token == Token.ORGANIZATION_NAME}) );
    
    fs.writeFile('db.json', JSON.stringify(lexer.lexems(), null, 2), (err)=>{
        if(err) throw err
    })

})

