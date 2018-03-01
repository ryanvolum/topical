import { ConsoleAdapter } from 'botbuilder-node';
import { Bot, MemoryStorage, BotStateManager } from 'botbuilder';
import { TopicClass, StringPrompt } from '../src/topical';
import { prettyConsole } from './prettyConsole';

const adapter = new ConsoleAdapter();

adapter.listen();

const bot = new Bot(adapter)
    .use(new MemoryStorage())
    .use(new BotStateManager())
    .use(prettyConsole)
    .onReceive(async c => {
        await TopicClass.do(c, () => infoBot.createInstance(c));
    });

let data: dataSet;
data = [
    {
        name: "name",
        prompt: "What's yo name?",
        type: "string"
    },
    {
        name: "age",
        prompt: "How old are ya?",
        type: "number"
    },
    {
        name: "color",
        prompt: "Which color is yo fave?",
        type: "string"
    }
];

interface slot {
    name: string,
    prompt: string,
    type: string
}

type dataSet = slot[];

interface infoBotState {
    data: dataSet,
    child: string,
    info: object
}

interface promptAnswers {
    name: string,
    value: string
}

const stringPrompt = new StringPrompt('stringPrompt');

const infoBot = new TopicClass<undefined, infoBotState, undefined>("infoBot")
    .init(async (c, t) => {
        c.reply("Yo! Let's get to know each other.");
        t.instance.state.info = {};
        t.instance.state.data = data;
    })
    .next(async (c, t) => {
        //Check if we still have anything to collect
        if (t.instance.state.data && t.instance.state.data.length > 0) {
            //Pop required data off the stack
            let slot = t.instance.state.data.pop();
            t.instance.state.child = await t.createTopicInstance(stringPrompt, {
                name: slot.name,
                prompt: slot.prompt
            });
        } else {
            let info = t.instance.state.info;
            let infoMessage = `Your name is ${info['name']} \n\r You're ${info['age']} years old \n\r Your favorite color is ${info['color']}`;

            c.reply("Word. Here's what I know about you:")
                .showTyping()
                .delay(1000)
                .reply(infoMessage);
        }
    })
    .onReceive(async (c, t) => {
        if (t.instance.state.child) {
            await t.dispatchToInstance(t.instance.state.child);
        }
        return t.next();
    })
    .onChildReturn(stringPrompt, async (c, t) => {
        t.instance.state.info[t.args.name] = t.args.value;
    })




