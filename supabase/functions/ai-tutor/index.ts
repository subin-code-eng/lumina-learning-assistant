
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced fallback responses with better educational content
const fallbackResponses = {
  mathematics: "**Mathematics Help:**\n\nFor math problems, I recommend:\n- Breaking complex problems into smaller steps\n- Understanding the underlying concepts rather than just memorizing formulas\n- Practice with similar problems to build confidence\n- Use visual aids like graphs or diagrams when possible\n\nWhat specific math topic would you like help with?",
  
  science: "**Science Learning:**\n\nScience concepts are best understood through:\n- Real-world examples and applications\n- Connecting new information to what you already know\n- Creating concept maps to visualize relationships\n- Hands-on experiments or demonstrations when possible\n\nWhich science topic interests you most?",
  
  history: "**History Study Tips:**\n\nWhen studying history, focus on:\n- **Understanding causation** rather than just memorizing dates and names\n- Creating timelines to see how events connect\n- Comparing historical events to contemporary situations\n- Understanding the broader context and consequences\n\nWhat historical period or event would you like to explore?",
  
  language: "**Language Learning:**\n\nEffective language study involves:\n- Consistent daily practice\n- Immersion through reading, listening, and speaking\n- Focus on practical communication over perfect grammar\n- Building vocabulary through context and usage\n\nWhat language skills would you like to improve?",
  
  general: "**Study Tips:**\n\nHere are some proven learning strategies:\n- **Active recall**: Test yourself frequently\n- **Spaced repetition**: Review material at increasing intervals\n- **Elaborative questioning**: Ask yourself 'why' and 'how'\n- **Teaching others**: Explain concepts to solidify understanding\n\nWhat subject or topic would you like to focus on today?"
};

function getFallbackResponse(query = "") {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes("math") || queryLower.includes("equation") || queryLower.includes("calculus")) {
    return fallbackResponses.mathematics;
  } else if (queryLower.includes("science") || queryLower.includes("biology") || queryLower.includes("chemistry") || queryLower.includes("physics")) {
    return fallbackResponses.science;
  } else if (queryLower.includes("language") || queryLower.includes("grammar") || queryLower.includes("vocabulary")) {
    return fallbackResponses.language;
  } else if (queryLower.includes("history") || queryLower.includes("century") || queryLower.includes("war")) {
    return fallbackResponses.history;
  }
  
  return fallbackResponses.general;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    
    // Check if Gemini API key is available
    if (!geminiApiKey) {
      console.log("Gemini API key not found, using enhanced offline mode");
      const { query } = await req.json();
      
      return new Response(
        JSON.stringify({ 
          response: `**Enhanced Learning Mode Active** 🎓\n\n${getFallbackResponse(query)}\n\n*To enable full AI capabilities, please add your Gemini API key to the Supabase Edge Function Secrets.*`,
          offline: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const { query, userPreferences, conversationContext } = await req.json();

    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ 
          response: "I didn't catch that. Could you please ask a question?" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Create system prompt
    let systemPrompt = `You are an AI tutor designed to help students learn any topic they ask about. 
    Your name is Study Buddy. Be friendly, encouraging, and educational.
    
    Adapt your responses based on these student preferences:
    - Learning style: ${userPreferences?.learningStyle || 'visual'}
    - Difficulty level: ${userPreferences?.difficulty || 'intermediate'}
    - Response detail: ${userPreferences?.responseLength || 'detailed'}
    
    Always provide clear explanations and encourage learning.`;

    console.log("Calling Gemini API with query:", query);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser question: ${query}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
      }
      
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error('No response from Gemini API');
      }
      
      console.log("Received Gemini response successfully");

      return new Response(
        JSON.stringify({ 
          response: aiResponse,
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      
      // Return enhanced fallback response
      return new Response(
        JSON.stringify({ 
          response: `**Connection Issue - Enhanced Mode** 🔄\n\n${getFallbackResponse(query)}\n\n*The AI service is temporarily unavailable. You can continue learning with these curated study tips!*`,
          offline: true,
          error: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        response: `**Study Mode** 📚\n\n${getFallbackResponse()}\n\n*I'm here to help with your studies using proven learning techniques!*`,
        offline: true,
        error: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
