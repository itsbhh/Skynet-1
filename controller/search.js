const searchQ = require('../dbmodels/queryDb.js');
const { AIData } = require('../dbmodels/aiDb.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const googleTrends = require('google-trends-api');

async function getTrendingTopics() {
    const apiKey = process.env.T_API_KEY;
    const url = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${apiKey}`;

    try {
        const response = await axios.get(url);
        const articles = response.data.articles;

        // console.log(`Trending Topics: ${articles}`);
        return articles;
    } catch (error) {
        console.error('Error fetching trending topics:', error);
    }
}


// Replace with your actual API key and Search Engine ID

async function searchRelatedQueries(query) {
    const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(url);
        const suggestions = response.data[1]; // The second element of the response contains the suggestions

        console.log(suggestions);
        return suggestions;
    } catch (error) {
        console.error('Error fetching search suggestions:');
    }
}

// Example usage

async function imageGetter(see,q) {
    let cardImage = null;
    if (see && see.result && see.result.data && see.result.data.items && see.result.data.items.length > 0) {
        let yeah = false;
        see.result.data.items.forEach(function (sees) {
            if (sees.pagemap.hcard) {
                yeah = true;
            }
        });
        if (yeah) {
            console.log('Card Images Added');
            return cardImage = await getreq(q);
        }

    }
}


async function getreq(q) {
    try {
        let subscriptionKey = process.env.KEY;
        let host = 'api.bing.microsoft.com';
        let path = '/v7.0/images/search';
        let term = q;

        const response = await axios.get(`https://${host}${path}?q=${encodeURIComponent(term)}`, {
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error.response.data);
        throw new Error('Failed to fetch data from the API.');
    }
}

module.exports.index = async (req, res) => {
    const trends = await getTrendingTopics();
    res.render('main/index.ejs', { trends });
};

module.exports.searchIndex = async (req, res) => {
    let { q } = req.body.search;
    console.log(q);
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        console.log(url, filename);
    }
    q = q.toLowerCase();
    console.log(q);
    let see = await searchQ.findOne({ "result.query": q }); // Use findOne instead of find
    console.log(see);
    if (see && see.result && see.result.query) {
        const condition = see.result.query;
        console.log(condition);
        if (q == condition) {
            console.log("Condition 1.1 Triggered");
            let suggestions = await searchRelatedQueries(q);
            //AI Code to be written in searchResult.ejs
            const prompt = q;
            let cardImage = await imageGetter(see,q);          
            // res.send(see);
            res.render('main/searchresult.ejs', { cardImage, suggestions, see, q });
            // Update the database with fresh data from API for future searches
            const apiKey = process.env.SEARCH_API_KEY;
            const cx = process.env.SEARCH_ID;
            const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(q)}&safe=active`;
            const searchResponse = await axios.get(apiUrl);
            const ros = searchResponse.data;
            console.log(see);
            // Update existing document with new data
            see.result.data = ros;
            await see.save();
            console.log("Database updated with fresh data for query:", q);
        }
    } else {
        const see = new searchQ({
            query: q,
            result: {
                query: q
            },
        });
        console.log(see);
        const apiKey = process.env.SEARCH_API_KEY;
        const cx = process.env.SEARCH_ID;
        const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(q)}&safe=active`;
        const searchResponse = await axios.get(apiUrl);
        const ros = searchResponse.data;
        see.result.data = ros;
        let suggestions = await searchRelatedQueries(q);
        let cardImage = await imageGetter(see,q);  
        await see.save();
        console.log("Condition 2 Triggered");
        res.render('main/searchresult.ejs', { cardImage, suggestions, see, q });
    }

};

module.exports.imageSearch = async (req, res) => {
    let { q } = req.body;
    console.log("Search query:", q); // Debugging statement

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        console.log("File uploaded:", filename); // Debugging statement
    }

    q = q.toLowerCase();
    const images = await getreq(q); // assuming getreq is an asynchronous function

    res.render('main/imagesearch.ejs', { images, q });
}