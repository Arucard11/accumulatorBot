import { Raydium, TxVersion, parseTokenAccountResp, PoolFetchType } from '@raydium-io/raydium-sdk-v2'
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import bs58 from 'bs58'
import dotenv from "dotenv"
dotenv.config()
let {Standard} = PoolFetchType
const connection = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
let owner = Keypair.generate()

export const fetchRpcPoolInfo = async (mint) => {
    let sol = 'So11111111111111111111111111111111111111112'
    let raydium = await Raydium.load({
        owner,
        connection,
        cluster:"mainnet",
        disableFeatureCheck: true,
        disableLoadToken: false,
        blockhashCommitment: 'finalized',
        // urlConfigs: {
        //   BASE_HOST: '<API_HOST>', // api url configs, currently api doesn't support devnet
        // },
      })
    // RAY-SOL
    
    const data = await raydium.api.fetchPoolByMints({
        mint1: 'So11111111111111111111111111111111111111112',
        mint2: mint, // optional,
        // extra params: https://github.com/raydium-io/raydium-sdk-V2/blob/master/src/api/type.ts#L249
        sort:"liquidity",
        order:"desc",
        type:Standard
      })
    
    if(data){      
        let poolInfo = {}
        let {id,mintA,mintB,day:{volume},mintAmountA,mintAmountB} = data.data[0]
        mintA.address === sol ? poolInfo['tokensInPool'] = mintAmountB : poolInfo["tokensInPool"] = mintAmountA
        poolInfo.id = id
  
        return poolInfo
    }
    

  }
  
  
 