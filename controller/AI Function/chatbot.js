const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const { history } = require("../../dbmodels/aiDb");

function formatText(text) {
    // Bold text: **text** or __text__
    text = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
    // Italic text: *text* or _text_
    text = text.replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>');
    // Strikethrough text: ~~text~~
    text = text.replace(/~~(.*?)~~/g, '<s>$1</s>');
    // Monospace text: `text`
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    // Blockquotes: > text
    text = text.replace(/^> (.*)/gm, '<blockquote>$1</blockquote>');
    // Ordered lists: 1. text
    text = text.replace(/^(\d+\..*)$/gm, '<ol><li>$1</li></ol>');
    // Unordered lists: * text or - text or + text
    text = text.replace(/^\*\s(.*)$/gm, '<ul><li>$1</li></ul>');
    text = text.replace(/^(-|\+)\s(.*)$/gm, '<ul><li>$2</li></ul>'); // Handle different bullet types
    // Horizontal rules: ---
    text = text.replace(/^\s*---\s*$/gm, '<hr>');
    // Links: [text](URL)
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    // Images: ![alt text](image URL)
    text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');
    // Code blocks: ```
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // Adjust spacing to remove overspacing
    text = text.replace(/\n\s*\n/g, '\n');
    text = text.replace(/\n/g, '</p><p>'); // Wrap with paragraph tags
    text = '<p>' + text + '</p>';

    return text;
}



async function run(file, input, _id) {
    // For text-only input, use the gemini-pro model
    let askAI
    if (file!=null){
        askAI = `${input} from \n${file}`;
    }
    else{
        askAI = `${input}`
    }
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    let chatHs;

    if (_id) {
        chatHs = await history.findById(_id); // Await here to get the actual value
    }

    if (!chatHs) {
        chatHs = new history({
            history: [
                {
                    role: 'User',
                    parts: [{ text: input }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Hello! I am Skynet, a multi-modal AI language model developed by Twoward Technology, Our Founder name is Sankalp Jain with his innovative mind and One Stop Solution Skynet is made with much more capabilities' }],
                },
            ],
        });
    } else {
        if (chatHs.history[0].role == 'User') {
            chatHs.history[0].parts.push({ text: input });
        }
    }
    const chat = model.startChat({
        history: chatHs.history,
        generationConfig: {
            maxOutputTokens: 1000000,
        },
    });

    const msg = askAI;
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = formatText(response.text());

    if (chatHs.history[1].role == 'model') {
        chatHs.history[1].parts.push({ text: text });
    }
    await chatHs.save();

    return { text, chatHs };
}

module.exports = { run }