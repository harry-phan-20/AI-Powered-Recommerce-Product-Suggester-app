export type FormInput = {
  name: string
  condition: 'Like New' | 'Good' | 'Fair'
  notes?: string
}

export type SuggestionResult = {
  marketingText: string
  category: string
}
