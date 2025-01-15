// Description: This file contains the code to get the metadata of a token.
export async function getMetadata(tokenAddress){
    let data = await fetch("https://tokens.jup.ag/token/"+tokenAddress)
    let metadata = await data.json()
    const {name,symbol} = metadata
    return {name,symbol}
}

