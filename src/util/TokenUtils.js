import TokenListSelector from "../constants/tokenAddress";
export function findTokenInList(item, chainID){ // token has address attribute
    const supportedTokens = TokenListSelector(chainID.toString());
    if(!item) return supportedTokens[chainID][0];

    let token =  supportedTokens[chainID].find(token => token.address.toLowerCase()==item.address.toLowerCase());
    if(token) return token;
    else return supportedTokens[chainID][0];
}
export function findTokenWithAddress(item,chainID){// input is an address 
    const supportedTokens = TokenListSelector(chainID.toString());
    if(!item) return supportedTokens[chainID][0];
    let token = supportedTokens[chainID].find(token => token.address.toLowerCase()==item.toLowerCase() );
    if(token) return token;
    else return supportedTokens[chainID][0]
}

export function findTokenWithSymbol(item,chainID){
    const supportedTokens = TokenListSelector(chainID.toString());
    let token = supportedTokens[chainID].find(token => token.symbol==item);
    if(token) return token;
    else return supportedTokens[chainID][0];
}