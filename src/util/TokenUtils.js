export function findTokenInList(item, supportedTokens){ // token has address attribute
    if(!item) return supportedTokens[0];

    let token =  supportedTokens.find(token => token.address.toLowerCase()==item.address.toLowerCase());
    if(token) return token;
    else return supportedTokens[0];
}
export function findTokenWithAddress(item,supportedTokens){// input is an address 
    if(!item) return supportedTokens[0];
    let token = supportedTokens.find(token => token.address.toLowerCase()==item.toLowerCase() );
    if(token) return token;
    else return supportedTokens[0]
}

export function findTokenWithSymbol(item,supportedTokens){
    let token = supportedTokens.find(token => token.symbol==item);
    if(token) return token;
    else return supportedTokens[0];
}