# Instagram Influencer Chat App Setup

## Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **CSV Data Loading**: Automatically loads influencer data from `/public/influencer-list.csv`
- **Data Cleaning**: Removes empty/null fields (Creator City, Gender, Language, Creator Country, Email, Phone, Other Links)
- **Chat Interface**: Clean, ChatGPT-style UI using shadcn/ui components
- **Real-time Responses**: Uses OpenAI GPT-3.5-turbo for intelligent responses
- **Error Handling**: Displays clear error messages for API failures
- **Loading States**: Shows skeleton loading animation during API calls

## File Structure

```
src/
├── app/
│   ├── api/ask/route.ts    # OpenAI API endpoint
│   ├── page.tsx            # Main page component
│   └── layout.tsx          # App layout
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── chat-interface.tsx  # Main chat component
└── lib/
    ├── utils.ts            # shadcn/ui utilities
    └── csv-parser.ts       # CSV parsing utilities
```

## Usage

1. The app automatically loads the influencer dataset on startup
2. Type your question in the input field at the bottom
3. Press Enter or click the Send button
4. View the AI response based on the influencer data

## Sample Questions

- "Who has the highest follower count?"
- "Which influencers are in the beauty category?"
- "What's the average engagement rate?"
- "Show me influencers from New York"
- "Who are the top 3 influencers by followers?" 