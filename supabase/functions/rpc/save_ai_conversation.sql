
-- Database function to save AI conversations
CREATE OR REPLACE FUNCTION public.save_ai_conversation(
  p_user_id UUID, 
  p_conversation_title TEXT, 
  p_messages JSONB
) RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_conversations (user_id, conversation_title, messages)
  VALUES (p_user_id, p_conversation_title, p_messages)
  ON CONFLICT (user_id, conversation_title)
  DO UPDATE SET messages = p_messages, updated_at = now();
  
  RETURN jsonb_build_object('success', true);
END;
$$;
