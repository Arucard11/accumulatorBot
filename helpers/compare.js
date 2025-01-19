
import { calculatePercentChange } from "./calculatePercentChange.js";
import { User } from "../DB/userSchema.js";
import { bot } from "./bot.js";
import { getMetadata } from "./getTokenMetadata.js";

export async function compare(tokenArray,user){ 
//first we want to get the tokens updated holder count and token held amount
    
    if(user.trackedPools.length > 1){
            for(let newToken of tokenArray){
                for(let token of user.trackedPools){
                    if(newToken.poolId === token.poolId){
                        let percentChange = calculatePercentChange(token.tokensInPool,newToken.tokensInPool)
                        if(percentChange <= user.settings.minChangePercent){
                            let {name,symbol} = await getMetadata(token.address)
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            console.log(name,symbol)
                            console.log(percentChange)
                        try{
                            let text = 
                            `This pool has had a 📈 <b>${percentChange.toFixed(4)}%</b> change in the tokens in its pool. Wallets are buying!\n✅ <b>Name:</b> ${name}\n📡 <b>Ticker:</b> <a href="https://t.me/share/url?url=$${symbol}">$${symbol}</a>\n🏚 <b>Mint Address:</b> <code>${token.address}</code>`;
                        bot.sendMessage(user.chatId, text, { parse_mode: "HTML" });
                        
                        }catch(e){
                            if(e) console.log(e)
                        }
                    }
                }
            }
        }
    }else{
        return
    }
    

}

