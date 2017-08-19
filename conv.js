'use strict';

const fs = require('fs');
const {Token} = require('./Token');

(function(filename){

    function tr(msg){
        return msg
    }
    function tokenValue(token){
        return token._value
    }

    let FieldName = {
        [Token.LITERAL]: 'unknown_field',
        [Token.ORGANIZATION_NAME]: 'title',
        [Token.STREET_NUMBER]: 'street_number',
        [Token.STREET_NAME]: 'street_name',
        [Token.PHONE]: 'phone',
        [Token.URL]: 'url',
        [Token.EMAIL]: 'emails',
        PHONES_LIST: 'phones',
        PHONE_TITLE: 'title',
        EMAILS_LIST: 'emails',
        EMAIL_TITLE: 'title',
        URLS_LIST: 'urls',
        URL_TITLE: 'title',
        GROUP_TITLE: 'title',
        ORGANIZATIONS_LIST: 'organizations',
        ADDRESSES_LIST: 'adresses'
    };
    
    function Group(name){
        this[FieldName.GROUP_TITLE] = tokenValue(name)
        this[FieldName.ORGANIZATIONS_LIST] = []

        this.addOrg = (org) => {
            this[FieldName.ORGANIZATIONS_LIST].push(org)
        }
        return this
    }
    function Organization(title){
        this[FieldName[Token.ORGANIZATION_NAME]] = tokenValue(title)
        this[FieldName.ADDRESSES_LIST] = []        
        this[FieldName.PHONES_LIST]   = []
        this[FieldName.EMAILS_LIST]   = []
        this[FieldName.URLS_LIST]     = []

        this.addAddress = (address) => {
            this[FieldName.ADDRESSES_LIST].push(address)
        }
        this.addPhone = (phone) => {
            this[FieldName.PHONES_LIST].push(phone)
        }
        this.addEmail = (email) => {
            this[FieldName.EMAILS_LIST].push(email)
        }
        this.addUrl = (url) => {
            this[FieldName.URLS_LIST].push(url)
        }

        return this
    }
    function Address(street_name, street_number){
        street_number = street_number || null

        this[FieldName[Token.STREET_NAME]] = tokenValue(street_name)
        this[FieldName[Token.STREET_NUMBER]] = tokenValue(street_number)
        this[FieldName.PHONES_LIST] = []

        this.addPhone = (phone) => {
            this[FieldName.PHONES_LIST].push(phone)
        }

        return this
    }
    function Phone(title, phone){
        this[FieldName.PHONE_TITLE]  = tokenValue(title)
        this[FieldName[Token.PHONE]] = tokenValue(phone)
        return this
    }
    function Email(title, email){
        this[FieldName.EMAIL_TITLE]  = tokenValue(title)
        this[FieldName[Token.EMAIL]] = tokenValue(email)
        return this
    }
    function Url(title, url){
        this[FieldName.URL_TITLE]  = tokenValue(title)
        this[FieldName[Token.URL]] = tokenValue(url)
        return this
    }

    function Root(){
        this.groups = []

        this.last_group = null
        this.last_org   = null
        this.last_addr  = null

        this.addGroup = (group) => {
            let o_group = new Group(group)
            this.groups.push( o_group )
            this.last_group = o_group

            this.last_org  = null
            this.last_addr = null
        }
        this.addOrg = (org) => {
            let o_org = new Organization(org)
            this.last_group.addOrg(o_org)
            this.last_org = o_org

            this.last_addr = null
        }
        this.addAddress = (street_name, street_number) => {
            street_number = street_number || null

            let o_addr = new Address(street_name, street_number)

            this.last_org.addAddress(o_addr)
            
            this.last_addr = o_addr
        }
        this.addPhone = (number) => {
            if( this.last_addr ){
                this.last_addr.addPhone(number)
                return
            }
            this.last_org.addPhone(number)
        }
        this.addEmail = (email) => {
            this.last_org.addEmail(email)
        }
        this.addUrl = (url) => {
            this.last_org.addUrl(url)
        }

        return this
    }

    function processData(data){
        if( ! data instanceof Array ){
            throw tr('Data must be array')
        }

        let root = new Root()

        for(let i = 0; i < data.length; i++){
            let item  = data[i]
            let next  = data[i+1]
            let token = item._token

            if( token === Token.ORGANIZATION_NAME && next._token === Token.ORGANIZATION_NAME ){
                root.addGroup(item)
                continue
            }
            else if( token === Token.ORGANIZATION_NAME ){
                root.addOrg(item)
                continue
            }
            else if( token === Token.STREET_NAME ) {
                if( next._token === Token.STREET_NUMBER ){
                    root.addAddress(token, next)
                    i++
                    continue
                }
                root.addAddress(item, null)
                continue
            }
            else if( token === Token.LITERAL && next._token === Token.PHONE ) {
                root.addPhone(item, next)
                i++
                continue
            }
            else if( token === Token.LITERAL && next._token === Token.EMAIL ) {
                root.addEmail(item, next)
                i++
                continue
            }
            else if( token === Token.LITERAL && next._token === Token.URL ) {
                root.addUrl(item, next)
                i++
                continue
            }
        }

        return root
    }

    fs.readFile(filename, 'utf8', function(err, data){
        if(err) throw err

        data = processData(data)
        data = JSON.stringify(data, null, 2)

        fs.writeFile(filename+'.conv.json', data, function(err){
            if(err) throw err
            console.log( tr('File successful writed.') )
        })
    })

})( process.argv[1] );
