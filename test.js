
import { getTokens } from "./helpers/getAllTokens.js"
import { filterByDate } from "./helpers/filterByDate.js"
import { fetchRpcPoolInfo } from "./helpers/getLiquidityPool.js"
import { compare } from "./helpers/compare.js"
import { User } from "./DB/userSchema.js"
import { connectDB } from "./DB/connectToDB.js"
connectDB()
async function test(){
let tokens = await getTokens()
  let filteredTokens = filterByDate(tokens,"year")
  let trackedPools = []
  let users = await User.find({})

  for(let token of filteredTokens){
          let tokenInfo = await fetchRpcPoolInfo(token.address)
          await new Promise(resolve => setTimeout(resolve, 3000));
          console.log(tokenInfo)
          if(tokenInfo){
              let tokenObj = {address:token.address,poolId:tokenInfo.id,tokensInPool:tokenInfo.tokensInPool}
              trackedPools.push(tokenObj)    
          }
      }

      for(let user of users){
        compare(trackedPools,user)
        user.trackedPools = trackedPools
        await user.save()
      }
   
}

test()