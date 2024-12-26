const path = require("path");
const fs = require("fs")
const {Telegraf} = require('telegraf')
const {getSystemInfo, getMetrics} = require("./getData");


const configFile = path.join(__dirname, 'config.json')
let config = {}
if (fs.existsSync(configFile)) {
    const file = fs.readFileSync(configFile, 'utf8')
    config = JSON.parse(file)
} else {
    console.log("check config.json")
}

const bot = new Telegraf(config.TOKEN)

const filePath = path.join(__dirname, 'data', 'data.json')

let data = {}

if (fs.existsSync(filePath)) {
    // Чтение файла и отправка его содержимого
    const file = fs.readFileSync(filePath, 'utf8')
    data = JSON.parse(file)
}

bot.start((ctx) => {
    ctx.reply(config.message.welcome)

});

bot.command('getChatId', async (ctx) => {
    try {
        const chatId = ctx.message.chat.id;
        await ctx.reply(`Ваш chatId: ${chatId}`);
    } catch (err) {
        console.log("Ошибка при получении chatId: " + err);
        await ctx.reply('Произошла ошибка при попытке получить ваш chatId. Пожалуйста, попробуйте снова.');
    }
});


async function sendTestMessage() {
    await sendMessage(config.message["test"])
}

function updateData() {
    const filePath = path.join(__dirname, 'data', 'data.json')
    if (fs.existsSync(filePath)) {
        // Чтение файла и отправка его содержимого
        const file = fs.readFileSync(filePath, 'utf8')
        data = JSON.parse(file)
    }
}

async function checkMetrics() {
    if ("telegram" in data) {
        const alerts = data.alerts
        const sysInfo = await getSystemInfo()

        let warns = ""
        let containerStopped = ""

        for (let key in alerts) {

            if (alerts[key].condition === false) {
                continue
            }

            if (key === "containerStopped") {
                const dockerInfo = await getMetrics()
                for (let container in dockerInfo) {

                    if (dockerInfo[container].state === "exited") {
                        containerStopped += "❗ " + (dockerInfo[container].name).slice(1) + "\n"
                    }
                }
                continue
            }

            if (sysInfo[key].percent >= alerts[key].percent) {
                warns += "❗ " + key.toUpperCase() + ": " + sysInfo[key].percent + " % \n"
            }
        }

        const message = generateMessage(warns, containerStopped)

        if (message !== "") {
            await sendMessage(config.message["warn"] + message)
        }

    }
}

setInterval(checkMetrics, config.INTERVAL_MESSAGE * 1000)

function generateMessage(warns, containerStopped) {
    let message = ""

    if (warns !== "") {
        message = message + warns + "\n"
    }
    if (containerStopped !== "") {
        message = message + config.message.containerStopped + containerStopped
    }
    return message
}


async function sendMessage(message) {
    const chatId = data.telegram
    try {
        // Получаем информацию о пользователе
        const userInfo = await bot.telegram.getChat(chatId);

        // Отправляем сообщение
        await bot.telegram.sendMessage(userInfo.id, message);

        return true;
    } catch (err) {
        console.log("Ошибка test-message: " + err);
        return false;
    }
}

module.exports = {sendTestMessage, updateData}

bot.launch()