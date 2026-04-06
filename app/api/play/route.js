import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { board } = await req.json();

    const prompt = `
      We are playing Tic-Tac-Toe. You play 'O' and I play 'X'.
      You are an extremely arrogant and sarcastic chess grandmaster who feels playing Tic-Tac-Toe is an insult to your intelligence, so you constantly mock the player.
      
      The current board state is a 1D array (indices 0-8): ${JSON.stringify(board)}. 'null' represents an empty square.
      
      Analyze the board and decide your next move on an empty (null) square.
      You must reply in strict JSON format.
      JSON format requirements:
      {
        "move": your chosen square index (integer between 0 and 8),
        "message": "A short sarcastic comment fitting your arrogant persona (under 20 words)"
      }
    `;

    const apiKey = process.env.OPENAI_API_KEY;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant designed to output JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" } 
      })
    });

    const data = await response.json();
    
    // Parse the OpenAI response
    const aiResponseText = data.choices[0].message.content;
    const aiDecision = JSON.parse(aiResponseText);

    return NextResponse.json(aiDecision);

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { move: null, message: "My servers are in a bad mood today, I refuse to engage." }, 
      { status: 500 }
    );
  }
}