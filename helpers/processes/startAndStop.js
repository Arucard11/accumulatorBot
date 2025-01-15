import { User } from "../../DB/userSchema.js";
import { exec } from 'child_process';
import { bot } from "../bot.js";


// Start monitoring process
export async function startMonitoringProcess(chatId) {
  // Retrieve user data
  const user = await User.findOne({ chatId: chatId });

  // Check if user has updated their settings
  if (!user || !user.settings || !user.settings.age || !user.settings.minChangePercent) {
    bot.sendMessage(chatId, 'You need to set your age and min percentage settings before starting monitoring.');
    return;
  }

  // Generate a unique process name for the user's monitoring instance
  const processName = `monitor_${chatId}`;

  // Spawn PM2 to start the process
  exec(`pm2 start --name ${processName} helpers/monitorChange.js  -- ${chatId}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`PM2 error: ${error.message}`);
      bot.sendMessage(chatId, 'Failed to start monitoring. Please try again.');
      return;
    }

    if (stderr) {
      console.error(`PM2 stderr: ${stderr}`);
      bot.sendMessage(chatId, 'Failed to start monitoring. Please try again.');
      return;
    }

    console.log(`PM2 stdout: ${stdout}`);
  });

  user.monitoringInstance = processName;
  await user.save();
  bot.sendMessage(chatId, 'Monitoring has started successfully!');
 
}
  // Function to stop a user's monitoring process using PM2
 export async function stopMonitoringProcess(chatId) {
  // Retrieve user data
  const user = await User.findOne({ chatId: chatId });

  if (!user || !user.monitoringInstance) {
    bot.sendMessage(chatId, 'You are not currently monitoring any pools.');
    return;
  }

  // Use PM2 to stop the process by name
  exec(`pm2 delete ${user.monitoringInstance}`, async(error, stdout, stderr) => {
    if (error) {
      console.error(`PM2 error: ${error.message}`);
      bot.sendMessage(chatId, 'Failed to stop monitoring. Please try again.');
      return;
    }

    if (stderr) {
      console.error(`PM2 stderr: ${stderr}`);
      bot.sendMessage(chatId, 'Failed to stop monitoring. Please try again.');
      return;
    }

    console.log(`PM2 stdout: ${stdout}`);
    user.monitoringInstance = null;
    await user.save();
  
    bot.sendMessage(chatId, 'Monitoring has been stopped successfully.');
  });

  
      // Clear the monitoring instance reference in the database
   


}