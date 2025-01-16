import { User } from "../../DB/userSchema.js";
import { exec } from 'child_process';
import { bot } from "../bot.js";
import { getTokens } from "../getAllTokens.js";
import { filterByDate } from "../filterByDate.js";
import { fetchRpcPoolInfo } from "../getLiquidityPool.js";


export async function startMonitoringProcess(chatId) {
  // Retrieve user data
  // const user = await User.findOne({ chatId: chatId });

  // // Check if user has updated their settings
  // if (!user || !user.settings || !user.settings.age || !user.settings.minChangePercent) {
  //   bot.sendMessage(chatId, 'You need to set your age and min percentage settings before starting monitoring.');
  //   return;
  // }

  // // Generate a unique process name for the user's monitoring instance
  // const processName = `monitor_${chatId}`;

  // // Spawn PM2 to start the process
  // exec(`pm2 start --name ${processName} helpers/monitorChange.js  -- ${chatId}`, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`PM2 error: ${error.message}`);
  //     bot.sendMessage(chatId, 'Failed to start monitoring. Please try again.');
  //     return;
  //   }

  //   if (stderr) {
  //     console.error(`PM2 stderr: ${stderr}`);
  //     bot.sendMessage(chatId, 'Failed to start monitoring. Please try again.');
  //     return;
  //   }

  //   console.log(`PM2 stdout: ${stdout}`);
  // });

  // user.monitoringInstance = processName;
  // await user.save();
  // bot.sendMessage(chatId, 'Monitoring has started successfully!');
      bot.sendMessage(chatId, 'Getting all tokens that match your age preference this might take some time...');
      const user = await User.findOne({chatId:chatId})
      let tokens = await getTokens()
      let filteredTokens = filterByDate(tokens,user.settings.age)
      console.log(filteredTokens.length)
      let tokenObjArray = []
  
      // then we get the liquidity pool info for each token
      for(let token of filteredTokens){
          let {id,tokensInPool} = await fetchRpcPoolInfo(token.address)
          if(id && tokensInPool){
              let tokenObj =  {address:token.address,poolId:id,tokensInPool:tokensInPool}
              tokenObjArray.push(tokenObj)    
          }
          await new Promise(resolve => setTimeout(resolve, 3000));
      }
      user.trackedPools = tokenObjArray
      await user.save()
      bot.sendMessage(chatId, 'Monitoring has started successfully!');

 
}
  
 export async function stopMonitoringProcess(chatId) {
  // Retrieve user data
  // const user = await User.findOne({ chatId: chatId });

  // if (!user || !user.monitoringInstance) {
  //   bot.sendMessage(chatId, 'You are not currently monitoring any pools.');
  //   return;
  // }

  // // Use PM2 to stop the process by name
  // exec(`pm2 delete ${user.monitoringInstance}`, async(error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`PM2 error: ${error.message}`);
  //     bot.sendMessage(chatId, 'Failed to stop monitoring. Please try again.');
  //     return;
  //   }

  //   if (stderr) {
  //     console.error(`PM2 stderr: ${stderr}`);
  //     bot.sendMessage(chatId, 'Failed to stop monitoring. Please try again.');
  //     return;
  //   }

  //   console.log(`PM2 stdout: ${stdout}`);
  //   user.monitoringInstance = null;
  //   await user.save();
  
  //   bot.sendMessage(chatId, 'Monitoring has been stopped successfully.');
  // });
  const user = await User.findOne({chatId:chatId})
  user.trackedPools = []
  await user.save()
  bot.sendMessage(chatId, 'Monitoring has been stopped successfully.');
}