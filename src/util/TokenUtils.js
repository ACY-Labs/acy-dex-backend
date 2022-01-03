
import supportedTokens from "../constants/chainTokens";

export function findTokenInList(item, chainID){ // token has address attribute
    if(!item) return supportedTokens[chainID][0];

    let token =  supportedTokens[chainID].find(token => token.address.toLowerCase()==item.address.toLowerCase());
    if(token) return token;
    else return supportedTokens[chainID][0];
}
export function findTokenWithAddress(item,chainID){// input is an address 
    if(!item) return supportedTokens[chainID][0];

    let token = supportedTokens[chainID].find(token => token.address.toLowerCase()==item.toLowerCase() );
    if(token) return token;
    else return supportedTokens[chainID][0]
}

export function findTokenWithSymbol(item,chainID){
    let token = supportedTokens[chainID].find(token => token.symbol==item);
    if(token) return token;
    else return supportedTokens[chainID][0];
}