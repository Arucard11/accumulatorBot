import dotenv from "dotenv";
dotenv.config()
import { getTokens } from "./getAllTokens.js";
import { filterByDate } from "./filterByDate.js";
import { fetchRpcPoolInfo } from "./getLiquidityPool.js";
import { compare } from "./compare.js";
import { User } from "../DB/userSchema.js";


// This function is responsible for monitoring changes in token liquidity pools
const userId = process.argv.slice(2)[0]

console.log(userId)         
export const monitorChange = async() =>{

    const user = await User.findOne({chatId:userId})

    // first we get all tokens and filter by date
    let tokens = await getTokens()
    let filteredTokens = filterByDate(tokens,user.settings.age).sort((a,b)=> a.daily_volume - b.daily_volume)
    console.log(filteredTokens.length)
    let tokenObjArray = []

    // then we get the liquidity pool info for each token
    for(let token of filteredTokens){
        console.log("token address pools that are being fetched ",token.address)
        let {id,tokensInPool} = await fetchRpcPoolInfo(token.address)
        if(id && tokensInPool){
            console.log(`Liquidity pool found for ${token.address} | pool Address: ${id} | total tokens held in pool: ${tokensInPool}`)
            let tokenObj =  {address:token.address,poolId:id,tokensInPool:tokensInPool}
            tokenObjArray.push(tokenObj)    
        }
    }
    
    // then we compare the token pool info with the user's tracked pools
    if(user.trackedPools.length > 1){
        compare(filteredTokens,userId)
        console.log("compare ran")
    }

    user.trackedPools = tokenObjArray
    await user.save()
    console.log("added data to DB")
    return
}


setInterval(async()=> await monitorChange(),14400000)