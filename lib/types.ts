export interface Profile {
  id: string
  user_id: string
  created_at: string
}

export interface WritingSample {
  id: string
  user_id: string
  content: string
  filename: string
  word_count: number
  created_at: string
}

export interface Rewrite {
  id: string
  user_id: string
  original_text: string
  rewritten_text: string
  intensity: number
  match_score: number
  created_at: string
}

export interface StyleTrait {
  id: string
  user_id: string
  trait_name: string
  trait_value: string
  score: number
  updated_at: string
}
