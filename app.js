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

const requestFormat = `
{
  gender: 'Male' | 'Female' | 'Other' | null;
  age: number | null;
  diet:
    | 'Vegetarian'
    | 'Vegan'
    | 'Pescatarian'
    | 'Keto'
    | 'Paleo'
    | 'Gluten Free'
    | 'Latose Free'
    | 'Tree Nut Free'
    | 'Diabetic'
    | 'None'
    | null;
  goal:
    | 'Lose Weight'
    | 'Gain Weight'
    | 'Maintain Weight'
    | 'Increase Flexibility'
    | 'Increase Endurance'
    | 'Practice Mindfulness'
    | null;
  date: string | null;
  daysOfTheWeek: {
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  };
}
`;
const planDetailsFormat = `\`\`\`{ index: number; date: string; dayOfTheWeek: | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'; exercises: { name: string; sets: number; reps: number; weight: number; description: string; }[]; }[]; \`\`\``;

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

app.post('/', async (req, res) => {
  console.log('Received POST request to /')
  try {
    const chatCopletion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: JSON.stringify(`You are an AI assistant that helps create workout plans. You will receive a list of user demographics and preferences in the format of JSON that adheres to this TypeScript interface: \`\`\` ${requestFormat} \`\`\`. Your goal is to create a workout plan that is tailored to the user's needs. You will respond with only a JSON object that contains the workout plan. That JSON object containing the workout plan will adhere strictly to this TypeScript interface: \`\`\` ${planDetailsFormat} \`\`\`. In your response include no other information or extra formatting. Don't lead with a greeting or any other text. And don't summarize the workout plan. Just respond with the workout plan. Make sure to include the delimeters \`\`\` in your response surrounding the JSON object representing the workout plan.`)
        },
        {
          role: 'user',
          content: JSON.stringify(req.body.planDetails)
        }
      ]
    })

    const firstChoice = chatCopletion.data.choices[0];

    console.log(firstChoice)

    // const firstDelim = firstChoice.message.content.search('```');
    // const newContent = firstChoice.message.content.slice(firstDelim + 3);
    // const secondDelim = newContent.search('```');
    // const finalContent = newContent.substring(0, secondDelim);
    // console.log(finalContent);

    res.status(200).json({
      resp: { firstChoice }
    })
  } catch (err) {
    console.assert('ERROR')
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