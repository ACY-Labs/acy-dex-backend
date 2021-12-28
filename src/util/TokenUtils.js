
import INITIAL_TOKEN_LIST from '../constants/uniqueTokens';

export function findTokenInList(item){ // token has address attribute
    if(!item) return INITIAL_TOKEN_LIST[0];

    let token =  INITIAL_TOKEN_LIST.find(token => token.address.toLowerCase()==item.address.toLowerCase());
    if(token) return token;
    else return INITIAL_TOKEN_LIST[0];
}
export function findTokenWithAddress(item){// input is an address 
    if(!item) return INITIAL_TOKEN_LIST[0];

    let token = INITIAL_TOKEN_LIST.find(token => token.address.toLowerCase()==item.toLowerCase() );
    if(token) return token;
    else return INITIAL_TOKEN_LIST[0]
}

export function findTokenWithSymbol(item){
    let token = INITIAL_TOKEN_LIST.find(token => token.symbol==item);
    if(token) return token;
    else return INITIAL_TOKEN_LIST[0];
}