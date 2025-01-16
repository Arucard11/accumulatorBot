import dotenv from 'dotenv';
dotenv.config();
import {connectDB} from './DB/connectToDB.js'
import cron from 'node-cron'
import {getTokens} from './helpers/getAllTokens.js'
import {filterByDate} from './helpers/filterByDate.js'
import {fetchRpcPoolInfo} from './helpers/getLiquidityPool.js'
import {compare} from './helpers/compare.js'
import {User} from './DB/userSchema.js'
import { startMonitoringProcess,stopMonitoringProcess } from './helpers/processes/startAndStop.js';
import TelegramBot from 'node-telegram-bot-api'
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
connectDB();

// Helper function to create inline buttons for the user interface
function getInlineKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Start Monitoring', 
            callback_data: 'start_monitoring' // Identifier for the button press
          },
          {
            text: 'Stop Monitoring',
            callback_data: 'stop_monitoring'
          }
        ],
        [
          {
            text: 'Change Settings',
            callback_data: 'change_settings'
          }
        ],
        [
          {
            text: 'View Status',
            callback_data: 'view_status'
          }
        ]
      ]
    }
  };
}
function getInlineKeyboardSettings() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Update age', 
            callback_data: "update_age" // Identifier for the button press
          }, 
        ],
        [
          {
            text: 'Update Percent of Change',
            callback_data: 'update_minChangePercent'
          }
        ]
      ]
    }
  };
}
function getInlineKeyboardAgeSettings() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '1 Year', 
            callback_data: "year" // Identifier for the button press
          },
          {
            text: '6 Months',
            callback_data: 'six months'
          },
          {
            text: '3 Months',
            callback_data: 'three months'
          },
          {
            text: ' 1 Month',
            callback_data: 'month'
          },
          {
            text: '1 Week',
            callback_data: 'one week'
          }
        
        ],
      
      ]
    }
  };
}
function getInlineKeyboardPercentSettings() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '0.10%', 
            callback_data: "0.10" // Identifier for the button press
          },
          {
            text: '1%',
            callback_data: '1'
          },
          {
            text: '10%',
            callback_data: '10'
          }
        ],
      
      ]
    }
  };
}


// Initialize the bot


// Command: Start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    // Check if the user exists
    let user = await User.findOne({ chatId: chatId });
    if (!user) {
      user = new User({
        chatId: chatId,    
      });
      await user.save();
      bot.sendMessage(chatId, `Welcome! In order to monitor token pools you must use /menu and choose "change settings" to set monitor preferences. Once you have set your preferences you can start monitoring by choosing "start monitoring" in the menu.`);
    } else {
      bot.sendMessage(chatId, 'Welcome back! Use /menu for options');
    }
  } catch (err) {
    console.error('Error in /start:', err);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
});


// Command to handle user initiation
bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;

  // Send welcome message with buttons
  bot.sendMessage(chatId,  'Choose an action below:', getInlineKeyboard());
});



// Handle button presses
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const callbackData = callbackQuery.data;

  switch (callbackData) {
    case 'start_monitoring':
      await startMonitoringProcess(chatId);
      break;

    case 'stop_monitoring':
      await stopMonitoringProcess(chatId);
      break;

    case 'change_settings':
      bot.sendMessage(chatId, 'Please choose an option below:', getInlineKeyboardSettings());
      
      break;

    case 'view_status':
      const user = await User.findOne({chatId: chatId});
      if (user && user.monitoringInstance) {
        bot.sendMessage(chatId, `You are currently monitoring token pools with the settings of | token age: 🗓 ${user.settings.age} |`);
      } else {
        bot.sendMessage(chatId, 'You are not currently monitoring any token pools.');
      }
      break;

    case "update_age":
      bot.sendMessage(chatId, 'Please provide the new age filter using the choices below 🗓(e.g., "1 year").',getInlineKeyboardAgeSettings());

      break;
    case "update_minChangePercent":

      bot.sendMessage(chatId, 'Please provide the new percent of change using the options below ⏰ (e.g., ".10").',getInlineKeyboardPercentSettings());
      break;
    case "year":
      await User.findOneAndUpdate({chatId}, {$set:{"settings.age": "year"}});
      bot.sendMessage(chatId, 'Age updated to 1 year.');
      break;
    case "six months":
      await User.findOneAndUpdate({chatId}, {$set:{"settings.age": "six months"}});
      bot.sendMessage(chatId, 'Age updated to 6 months.');
      break;
    case "three months":
      await User.findOneAndUpdate({chatId}, {$set:{"settings.age": "three months"}});
      bot.sendMessage(chatId, 'Age updated to 3 months.');
      break;
    case "month":
      await User.findOneAndUpdate({chatId}, {$set:{"settings.age": "month"}});
      bot.sendMessage(chatId, 'Age updated to 1 month.');
      break;
    case "one week":
      await User.findOneAndUpdate({chatId}, {$set:{"settings.age": "week"}});
      bot.sendMessage(chatId, 'Age updated to 1 week.');
      break;
    case "0.10":
      await User.findOneAndUpdate({chatId}, {$set:{"settings.minChangePercent": -0.001}});
      bot.sendMessage(chatId, 'minChangePercent updated to 0.10%.');
      break;
    case "1":
      await User.findOneAndUpdate({chatId}, {$set:{"settings.minChangePercent": -0.01}});
      bot.sendMessage(chatId, 'minChangePercent updated to 1%.');
      break;
    case "10":
      await User.findOneAndUpdate({chatId}, {$set:{"settings.minChangePercent": -10}});
      bot.sendMessage(chatId, 'minChangePercent updated to 10%.');
      break;
    default:
      bot.sendMessage(chatId, 'Invalid action.');
  }

  // Acknowledge the callback query to prevent Telegram from showing the "loading" spinner
  bot.answerCallbackQuery(callbackQuery.id);
});


// Handle unknown commands
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (!msg.text.startsWith('/')) {
    bot.sendMessage(chatId, 'I did not understand that. Use /settings to update your preferences.');
  }
});

console.log('Bot is running...');


cron.schedule('0 */2 * * *', async() => {
  let tokens = await getTokens()
  let filteredTokens = filterByDate(tokens,"year")
  let trackedPools = []
  let users = await User.find({})

  for(let token of filteredTokens){
          let {id,tokensInPool} = await fetchRpcPoolInfo(token.address)
          if(id && tokensInPool){
              let tokenObj = {address:token.address,poolId:id,tokensInPool:tokensInPool}
              trackedPools.push(tokenObj)    
          }
          await new Promise(resolve => setTimeout(resolve, 3000));
      }

  for(let user of users){
    compare(trackedPools,user)
    user.trackedPools = trackedPools
    await user.save()
  }
});