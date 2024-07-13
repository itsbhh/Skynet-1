require('dotenv').config();
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const { AIData, history } = require("../dbmodels/aiDb.js");
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const fd = require('fs');
const path = require('path');
const mime = require('mime-types');
const { run } = require('./AI Function/chatbot.js');
const { analyzeExcel, getUserInput } = require("./AI Function/dataAnalysis.js");


function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fd.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const amOrPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
}



module.exports.index = async (req, res) => {
    res.render("main/skynet.ejs");
}

module.exports.answer = async (req, res) => {
    let { input } = req.body.ai;
    const _id = req.body._id;
    input = input.toLowerCase();
    time = getCurrentTime();
    if (req.file) {
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        const mimeType = mime.lookup(fileExtension);
        console.log(mimeType);

        if (mimeType && mimeType.startsWith('image')) {
            // Handle image file
            const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
            const url = req.file.path;
            const filename = req.file.filename;
            const aiData = new AIData({
                file: {
                    url: url,
                    filename: filename
                }
            });
            const imagePart = fileToGenerativePart(url, mimeType);
            const prompt = input;
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();
            console.log(text);
            await aiData.save();
            return res.send(formatText(text));
        } else if (mimeType && mimeType === 'application/pdf') {
            // Handle PDF file
            console.log('PDF recieved')
            let url = req.file.path;
            let filename = req.file.filename;
            const pdfPath = path.join(__dirname, '..', 'uploads', filename);
            const data = await fs.readFile(pdfPath);
            const pdfData = await pdfParse(data);
            console.log(pdfData.text);
            const aiData = new AIData({
                file: {
                    url: url,
                    filename: filename
                }
            });
            const response = await run(pdfData.text, input, _id);
            let text = response.text;
            const chatHs = response.chatHs;
            await aiData.save();
            console.log(text);
            return res.render("main/skynetAI.ejs", { text, input, chatHs, mime, time });
        } else if (mimeType && (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            const analysisResult = await analyzeExcel(req.file.path);

            const labels = analysisResult.labels;
            const values = analysisResult.values;

            const processedData = analysisResult.values.map(obj => {
                return Object.entries(obj).flatMap(([value, frequency]) => {
                    // Repeat each numerical value according to its frequency
                    return Array.from({ length: frequency }, () => parseFloat(value));
                });
            });

            // Respond with analysis result and graphs
            res.render("sample.ejs", { processedData, analysisResult }); // Pass processedData to the template

        } else {
            return res.status(400).send("Unsupported file type");
        }
    } else {
        const response = await run(file = null, input, _id);
        let text = response.text;
        const chatHs = response.chatHs;
        res.render("main/skynetAI.ejs", { text, input, chatHs, mime, time });
    }
};
