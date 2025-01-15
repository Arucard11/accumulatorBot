

export async function getTokens(){
    let tokens = await (await fetch("https://tokens.jup.ag/tokens_with_markets")).json()
    // console.log(tokens)
    return tokens
   
}
   

