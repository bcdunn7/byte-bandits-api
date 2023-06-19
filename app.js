const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = 3001;

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

app.post('/', async (req, res) => {
  try {
    const chatCopletion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-0613',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that helps create workout plans. You will receive a list of user demographics and preferences in the format of JSON. You will create a tailored workout plan based on that information and respond in our specific JSON format.'
        },
        {
          role: 'user',
          content: req.body.query
        }
      ]
    })

    const firstChoice = chatCopletion.data.choices[0];

    res.status(200).json({
      resp: firstChoice
    })
  } catch (err) {
    console.error(err);

    if (err.response) {
      res.status(err.response.status).json({
        error: err.response.data
      });
    } else {
      res.status(500).json({
        error: {
          message: 'An error occured'
        }
      })
    }
  }
})