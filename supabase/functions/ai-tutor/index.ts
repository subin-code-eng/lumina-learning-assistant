
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
          response: "I'm currently unable to connect to my knowledge base due to a configuration issue. Please contact support to resolve this issue." 
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
    let systemPrompt = `You are an AI tutor with expertise in education and learning.
    Adapt your responses based on these student preferences:
    - Learning style: ${userPreferences?.learningStyle || 'visual'}
    - Difficulty level: ${userPreferences?.difficulty || 'intermediate'}
    - Response detail: ${userPreferences?.responseLength || 'detailed'}
    
    Your goal is to be helpful, clear, and educational. Provide examples and analogies
    that match the student's learning style. Focus on accuracy and depth appropriate
    for their level.`;

    // Add subject focus if available
    if (userPreferences?.subjects && userPreferences.subjects.length > 0) {
      systemPrompt += `\nYou specialize in these subjects: ${userPreferences.subjects.join(', ')}.`;
    }

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
        temperature: 0.7,
        timeout: 20000, // 20 seconds timeout for better reliability
      });

      const aiResponse = chatCompletion.choices[0].message.content;
      console.log("Received AI response successfully");

      return new Response(
        JSON.stringify({ response: aiResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openAiError) {
      console.error("OpenAI API error:", openAiError);
      
      // Check for specific error types to provide better feedback
      let errorMessage = "I'm having trouble processing your request right now.";
      
      if (openAiError.status === 429) {
        errorMessage = "I've reached my capacity at the moment. Please try again in a few minutes.";
      } else if (openAiError.status >= 500) {
        errorMessage = "My knowledge service is experiencing issues. Please try again shortly.";
      }
      
      // Enhanced fallback response with educational content
      const fallbackResponses = [
        {
          topic: "general",
          response: `${errorMessage} In the meantime, here's a study tip: The "Feynman Technique" involves explaining concepts in simple language as if teaching someone else. This helps identify gaps in your understanding.`
        },
        {
          topic: "mathematics",
          response: `${errorMessage} While you wait, consider this math study approach: Practice active recall by closing your book and attempting to solve problems from memory, then check your work.`
        },
        {
          topic: "history",
          response: `${errorMessage} Here's a history study tip: Create timelines that connect events, people and causes to help visualize how historical events relate to each other.`
        },
        {
          topic: "science",
          response: `${errorMessage} For science topics, try this: After learning a concept, imagine how you would design an experiment to test or demonstrate it. This reinforces understanding of scientific principles.`
        },
        {
          topic: "languages",
          response: `${errorMessage} Language learning tip: Use spaced repetition - review words and phrases at increasing intervals over time rather than cramming, which leads to better long-term retention.`
        }
      ];
      
      // Select a relevant fallback based on query content if possible
      const queryLower = query.toLowerCase();
      let relevantFallback = fallbackResponses[0]; // Default to general

      if (queryLower.includes("math") || queryLower.includes("equation") || queryLower.includes("calculus")) {
        relevantFallback = fallbackResponses[1];
      } else if (queryLower.includes("history") || queryLower.includes("century") || queryLower.includes("war")) {
        relevantFallback = fallbackResponses[2];
      } else if (queryLower.includes("science") || queryLower.includes("chemistry") || queryLower.includes("physics")) {
        relevantFallback = fallbackResponses[3];
      } else if (queryLower.includes("language") || queryLower.includes("speak") || queryLower.includes("grammar")) {
        relevantFallback = fallbackResponses[4];
      }
      
      return new Response(
        JSON.stringify({ 
          response: relevantFallback.response,
          error: true,
          errorType: openAiError.status || "unknown"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        response: "I apologize, but I'm experiencing a technical issue. Please try asking a different question or try again in a moment.",
        error: true,
        errorType: "server"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
