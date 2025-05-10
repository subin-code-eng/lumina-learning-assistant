
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.20.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAiApiKey) {
      console.error("Missing OpenAI API key");
      return new Response(
        JSON.stringify({ 
          response: "I'm currently unable to connect to my knowledge base. Please try again in a moment or contact support if this issue persists." 
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

    // Initialize OpenAI client with the API key
    const openai = new OpenAI({
      apiKey: openAiApiKey,
    });

    // Create a system prompt based on user preferences
    const systemPrompt = `You are an AI tutor with expertise in education and learning.
    Adapt your responses based on these student preferences:
    - Learning style: ${userPreferences?.learningStyle || 'visual'}
    - Difficulty level: ${userPreferences?.difficulty || 'intermediate'}
    - Response detail: ${userPreferences?.responseLength || 'detailed'}
    
    Your goal is to be helpful, clear, and educational. Provide examples and analogies
    that match the student's learning style. Focus on accuracy and depth appropriate
    for their level.

    If the user encounters any connection issues, gracefully handle them with suggestions for
    common study techniques or learning methods.
    `;

    console.log("Calling OpenAI API with query:", query);
    
    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...(conversationContext?.map(msg => ({ role: "user", content: msg })) || []),
          { role: "user", content: query }
        ],
        max_tokens: 1000,
        timeout: 15000, // 15 seconds timeout
      });

      const aiResponse = chatCompletion.choices[0].message.content;
      console.log("Received AI response successfully");

      return new Response(
        JSON.stringify({ response: aiResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openAiError) {
      console.error("OpenAI API error:", openAiError);
      
      // Fallback response for OpenAI-specific errors
      const fallbackTips = [
        "To improve your study sessions, try the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break.",
        "Visual learners benefit from mind maps and diagrams. Kinesthetic learners do better with hands-on activities.",
        "Spaced repetition is more effective than cramming. Review material at increasing intervals to improve retention.",
        "Teaching concepts to others is one of the most effective ways to solidify your understanding.",
        "Set specific, measurable goals for each study session rather than vague objectives."
      ];
      
      const randomTip = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
      
      return new Response(
        JSON.stringify({ 
          response: `I'm having trouble processing your specific question right now, but here's a helpful study tip: ${randomTip}\n\nPlease try asking a different question.` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        response: "I apologize, but I'm experiencing a technical issue. Please try asking a different question or try again in a moment." 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
