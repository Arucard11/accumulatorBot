
import { calculatePercentChange } from "./calculatePercentChange.js";
import { User } from "../DB/userSchema.js";
import { bot } from "./bot.js";
import { getMetadata } from "./getTokenMetadata.js";

export async function compare(tokenArray,user){ 
//first we want to get the tokens updated holder count and token held amount
    
    if(user.trackedPools.length > 1){
            for(newToken of tokenArray){
                for(token of user.trackedPools){
                    if(newToken.poolId === token.poolId){
                        let percentChange = calculatePercentChange(token.tokensInPool,newToken.tokensInPool)
                        if(percentChange <= user.settings.minChangePercent){
                        let {name,symbol} = await getMetadata(token.address)
                        bot.sendMessage(user.chatId,`this pool has had a ${percentChange}% change in the tokens in its pool, wallets are buying! \nname:${name}\nticker:${symbol} \nmint address:${token.address}`)
                    }
                }
            }
        }
    }else{
        return
    }
    

}