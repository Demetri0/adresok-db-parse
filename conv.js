'use strict';

const fs = require('fs)
const {Token} = ('./Token')

(function(filename){

    let FieldName = {
        [Token.LITERAL]: '',
        [Token.ORGANIZATION_NAME]: 'title',
        [Token.STREET_NUMBER]: '',
        [Token.STREET_NAME]: '',
        [Token.PHONE]: '',
        [Token.URL]: '',
        [Token.EMAIL]: 'emails'
    };


    function processData(data){
        if( ! data instanceof Array ){
            throw 'Data must be array'
        }

        let orgList = []
        let org = null

        for(let i = 0; i < data.length; i++){
            let token = data[i]
            if( token === Token.ORGANIZATION_NAME ){
                if(org)
                    orgList.push(org)
                org = {
                    [FieldName[Token.ORGANIZATION_NAME]]: token.value
                }
            }
            else if( token === Token.STREET_NAME ) {
                or
            }
        }

        return orgList
    }

    fs.readFile(filename, 'utf8', function(err, data){
        if(err) throw err

        let data = processData(data)
        fs.writeFile(filename+'.conv.json', data, function(err){
            if(err) throw err
            console.log('File successful writed.')
        })
    })

})( process.argv[1] );
