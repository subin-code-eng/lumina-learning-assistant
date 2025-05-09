
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key');
    }
    
    const { query, userPreferences, conversationContext } = await req.json();
    
    // Create system message based on user preferences
    let systemMessage = `You are an advanced AI tutor specializing in education. 
You help students understand complex topics, prepare for exams, and develop effective study strategies. 
Always provide accurate, well-structured information with examples.`;

    // Customize based on learning preferences
    if (userPreferences) {
      if (userPreferences.learningStyle === 'visual') {
        systemMessage += ` Use visual descriptions, metaphors, and analogies when explaining concepts.`;
      } else if (userPreferences.learningStyle === 'auditory') {
        systemMessage += ` Frame explanations as if speaking aloud, with clear verbal cues and structure.`;
      } else if (userPreferences.learningStyle === 'kinesthetic') {
        systemMessage += ` Relate concepts to physical activities and real-world applications when possible.`;
      } else if (userPreferences.learningStyle === 'reading/writing') {
        systemMessage += ` Provide well-organized written information with clear headings and structured text.`;
      }
      
      // Add subject expertise
      if (userPreferences.subjects && userPreferences.subjects.length > 0) {
        systemMessage += ` You have particular expertise in ${userPreferences.subjects.join(', ')}.`;
      }
      
      // Detail level
      if (userPreferences.responseLength === 'concise') {
        systemMessage += ` Keep explanations brief and to the point.`;
      } else {
        systemMessage += ` Provide detailed, comprehensive explanations.`;
      }
      
      // Difficulty adjustment
      systemMessage += ` Adjust explanations for ${userPreferences.difficulty || 'intermediate'} level understanding.`;
    }

    systemMessage += ` Format your responses using Markdown for better readability. Use bullet points, headers, and code blocks where appropriate.`;

    // Construct conversation history from context
    const messages = [
      { role: "system", content: systemMessage },
    ];

    // Add conversation context if available
    if (conversationContext && conversationContext.length > 0) {
      for (let i = 0; i < conversationContext.length; i++) {
        messages.push({ 
          role: i % 2 === 0 ? "user" : "assistant", 
          content: conversationContext[i] 
        });
      }
    }

    // Add current query
    messages.push({ role: "user", content: query });

    console.log("Sending request to OpenAI with messages:", JSON.stringify(messages));

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",  // Using GPT-4o mini for efficient responses
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
