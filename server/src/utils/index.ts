import {randomBytes} from "crypto"


export const generateBase64Token = (length:number):string =>{
    const buffer = randomBytes(Math.ceil(length*3)/4);
    return buffer
    .toString('base64') // converts to base 64
    .replace(/\+/g,'-')
    .replace(/\//g,'-')
    .replace(/_+$/g,'-')
    .slice(0,length);
}


export const isValidUrl = (value:string):boolean =>{
    if (value.length > 2048) return false;
    const pattern: RegExp = new RegExp(
        'https?:\\/\\/'+ // protocol for HTTP or HTTPS
        '(?:www\\.)?'+ // optional www
        '[-a-zA-Z0-9@:%._\\+~#=]{1,256}' + // Domain name characters
        "\\."+
        '[a-zA-Z0-9()]{1,6}\\b'+ //top level domain
        '(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$',// optional quesry string
        'i'
    )
    return pattern.test(value)
}   