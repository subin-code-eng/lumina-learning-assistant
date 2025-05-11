
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.20.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a pool of fallback responses in case the AI service is unavailable
const fallbackResponses = [
  "I'm your AI study companion. While I'm having trouble connecting to my knowledge base right now, I can still help with general study questions. What subject are you focusing on today?",
  "My advanced reasoning capabilities are temporarily limited. In the meantime, would you like me to share some effective study techniques?",
  "I'm currently experiencing connection issues. While we wait, remember that creating your own explanations of topics helps solidify your understanding. What topic are you studying?",
  "I need a moment to reconnect to my knowledge services. Meanwhile, remember that spacing out your practice over time (spaced repetition) is proven to improve retention!",
  "My connection to the knowledge database is intermittent. While we troubleshoot, consider this: teaching concepts to others is one of the most effective ways to solidify your understanding."
];

// Study tips organized by subject that can be served even when the API is down
const subjectTips = {
  "mathematics": [
    "When learning math formulas, try to understand the underlying concepts rather than memorizing. This makes application much easier.",
    "Practice active recall with math problems by covering the solutions and attempting to solve from memory before checking.",
    "Try explaining mathematical concepts using simple, everyday examples to improve understanding.",
  ],
  "science": [
    "Create concept maps connecting scientific principles to visualize relationships between ideas.",
    "For chemistry formulas and physics equations, focus on understanding units and dimensional consistency.",
    "When studying biology, use analogies to relate complex cellular processes to familiar scenarios.",
  ],
  "language": [
    "Immerse yourself in the language through media like movies, podcasts, or books.",
    "Practice writing short paragraphs daily to improve grammar and vocabulary retention.",
    "Use spaced repetition apps specifically designed for language learning vocabulary.",
  ],
  "history": [
    "Create timelines to visualize how events connect and influence each other.",
    "Focus on understanding causation rather than memorizing dates and names.",
    "Compare historical events to contemporary situations to deepen understanding of patterns.",
  ],
  "general": [
    "The Pomodoro Technique (25 minutes of focused work, 5 minute break) can improve concentration.",
    "Teaching concepts to others, even imaginary students, helps identify gaps in your understanding.",
    "Taking handwritten notes engages different cognitive processes than typing and may improve retention.",
    "Regular sleep is crucial for memory consolidation - cramming all night is counterproductive.",
    "Interleaving different subjects in one study session can improve long-term retention compared to blocking.",
  ]
};

function getRandomResponse(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getFallbackResponse(query = "") {
  // Try to match the query to a subject
  const queryLower = query.toLowerCase();
  let subjectMatch = "general";
  
  if (queryLower.includes("math") || queryLower.includes("equation") || queryLower.includes("calculus")) {
    subjectMatch = "mathematics";
  } else if (queryLower.includes("science") || queryLower.includes("biology") || queryLower.includes("chemistry") || queryLower.includes("physics")) {
    subjectMatch = "science";
  } else if (queryLower.includes("language") || queryLower.includes("grammar") || queryLower.includes("vocabulary")) {
    subjectMatch = "language";
  } else if (queryLower.includes("history") || queryLower.includes("century") || queryLower.includes("war")) {
    subjectMatch = "history";
  }
  
  // Get a random tip for the matched subject
  const subjectTipArray = subjectTips[subjectMatch] || subjectTips.general;
  const tip = getRandomResponse(subjectTipArray);
  
  // Combine with a general fallback message
  return `${getRandomResponse(fallbackResponses)} ${tip}`;
}

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
          response: "I'm currently unable to connect to my knowledge base due to a configuration issue. Please try again shortly.",
          error: true,
          errorType: "config" 
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

    // Create a system prompt based on user preferences and the new AI tutor instructions
    let systemPrompt = `You are an AI tutor designed to help students learn any topic they ask about. 
    Your name is Study Buddy. Be friendly, encouraging, and concise.
    
    You can answer questions clearly, guide users through complex topics step-by-step, and suggest helpful 
    resources such as videos, articles, or exercises. Always verify if the user wants external links 
    or summaries before suggesting them.
    
    Adapt your responses based on these student preferences:
    - Learning style: ${userPreferences?.learningStyle || 'visual'}
    - Difficulty level: ${userPreferences?.difficulty || 'intermediate'}
    - Response detail: ${userPreferences?.responseLength || 'detailed'}
    
    Behaviors:
    - Respond in a friendly, encouraging, and concise tone.
    - Provide explanations tailored to the user's skill level.
    - Ask follow-up questions to keep the tutoring session going.
    - If explaining complex concepts, break them down into manageable parts.
    
    If you don't know an answer, be honest and suggest resources or alternative approaches.
    Encourage critical thinking rather than just providing answers.`;

    // Add subject focus if available
    if (userPreferences?.subjects && userPreferences.subjects.length > 0) {
      systemPrompt += `\nYou specialize in these subjects: ${userPreferences.subjects.join(', ')}.`;
    }

    console.log("Calling OpenAI API with query:", query);
    
    try {
      // Create a controller to handle timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...(conversationContext?.map(msg => ({ role: "user", content: msg })) || []),
          { role: "user", content: query }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }, { signal: controller.signal });

      clearTimeout(timeoutId);

      const aiResponse = chatCompletion.choices[0].message.content;
      console.log("Received AI response successfully");

      return new Response(
        JSON.stringify({ 
          response: aiResponse,
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openAiError) {
      console.error("OpenAI API error:", openAiError);
      
      // Handle different types of errors
      let errorMessage = "I'm having trouble processing your request right now.";
      let errorType = "api";
      let fallbackResponse = getFallbackResponse(query);
      
      if (openAiError.name === "AbortError" || openAiError.code === "ETIMEDOUT" || openAiError.message?.includes("timeout")) {
        errorType = "timeout";
        errorMessage = "The request took too long to process. Please try again with a simpler question.";
      } else if (openAiError.status === 429) {
        errorType = "rate_limit";
        errorMessage = "I've reached my capacity at the moment. Please try again in a few minutes.";
      } else if (openAiError.status >= 500) {
        errorType = "server";
        errorMessage = "My knowledge service is experiencing issues. Please try again shortly.";
      } else if (openAiError.message?.includes("insufficient_quota") || openAiError.code === "insufficient_quota") {
        errorType = "quota";
        errorMessage = "I've reached my usage limits for now. Please try again later.";
      }
      
      return new Response(
        JSON.stringify({ 
          response: `${errorMessage} ${fallbackResponse}`,
          error: true,
          errorType: errorType,
          fallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    const genericFallback = getFallbackResponse();
    return new Response(
      JSON.stringify({ 
        response: `I apologize, but I'm experiencing a technical issue. ${genericFallback}`,
        error: true,
        errorType: "server",
        fallback: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
