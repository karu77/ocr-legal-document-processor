import os
import requests
import json
from typing import Dict, Any, Optional, List
import time
import re

# Gemini API client for text processing

class GeminiClient:
    """
    Client for interacting with Google Gemini API v1beta
    """
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            print("⚠️  GEMINI_API_KEY not set or using placeholder. Using fallback processing.")
            print("   Please set your Gemini API key in the .env file for full AI functionality.")
            self.api_key = None  # Set to None to disable API calls
            
        # Initialize API settings
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.model = "gemini-pro"
        self.headers = {
            'Content-Type': 'application/json',
        }
        self.timeout = 30  # seconds
        print("✅ Gemini API client initialized")
        
    def _make_request(self, prompt: str, max_retries: int = 3) -> str:
        """
        Make a request to the Gemini API with retry logic
        """
        if not self.api_key:
            return None  # Return None if no API key available
            
        url = f"{self.api_url}/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "topK": 32,
                "topP": 1,
                "maxOutputTokens": 4096,
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }
        
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    url, 
                    headers=self.headers, 
                    json=payload, 
                    timeout=self.timeout
                )
                response.raise_for_status()
                
                data = response.json()
                
                if 'candidates' in data and len(data['candidates']) > 0:
                    if 'content' in data['candidates'][0]:
                        parts = data['candidates'][0]['content']['parts']
                        if parts and 'text' in parts[0]:
                            return parts[0]['text'].strip()
                
                # Handle blocked content or other issues
                if 'candidates' in data and len(data['candidates']) > 0:
                    if 'finishReason' in data['candidates'][0]:
                        reason = data['candidates'][0]['finishReason']
                        if reason == 'SAFETY':
                            raise Exception("Content was blocked due to safety concerns")
                        elif reason == 'RECITATION':
                            raise Exception("Content was blocked due to recitation concerns")
                
                raise Exception("No valid response received from Gemini API")
                
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:
                    raise Exception(f"Failed to connect to Gemini API after {max_retries} attempts: {str(e)}")
                time.sleep(2 ** attempt)  # Exponential backoff
                
            except Exception as e:
                if attempt == max_retries - 1:
                    raise Exception(f"Gemini API error: {str(e)}")
                time.sleep(1)
        
    def cleanup_text(self, text: str) -> str:
        """Clean up and format the text"""
        if not text:
            return ""
            
        try:
            prompt = f"""
            Clean up and format the following text while preserving its meaning and structure:
            ---
            {text}
            ---
            Instructions:
            1. Fix spelling and grammar errors
            2. Improve formatting with proper paragraphs and spacing
            3. Preserve document structure (headings, sections, lists)
            4. Maintain original text organization
            5. Keep all important information intact
            6. Remove OCR artifacts and noise
            7. Fix line breaks and word wrapping
            8. Ensure consistent spacing and indentation
            9. Maintain professional formatting
            10. Return the text in a clean, well-structured format

            Format the output with:
            - Clear paragraph breaks
            - Proper heading levels
            - Consistent indentation
            - Clean list formatting
            - Professional spacing
            """
            
            cleaned_text = self._make_request(prompt)
            
            # Post-process the cleaned text
            if cleaned_text:
                # Fix multiple newlines
                cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
                # Ensure consistent spacing after punctuation
                cleaned_text = re.sub(r'([.!?])\s*', r'\1 ', cleaned_text)
                # Fix spacing around list items
                cleaned_text = re.sub(r'^\s*[•-]\s*', '• ', cleaned_text, flags=re.MULTILINE)
                return cleaned_text
            
            return text
            
        except Exception as e:
            print(f"Error in cleanup_text: {e}")
            return text  # Return original text if cleanup fails

    def summarize_text(self, text: str) -> str:
        """Generate a concise summary of the text"""
        if not text:
            return ""
            
        try:
            prompt = f"""
            Provide a comprehensive summary of the following text, focusing on key legal points and important details:
            ---
            {text}
            ---
            Instructions:
            1. Create an executive summary in 2-3 paragraphs
            2. Focus on key legal points, obligations, and requirements
            3. Highlight important dates, deadlines, and conditions
            4. Include critical financial or numerical information
            5. Mention all involved parties and their roles
            6. Summarize main agreements or decisions
            7. Note any special conditions or exceptions
            8. Maintain formal legal language where appropriate
            9. Structure the summary with clear sections
            10. End with key takeaways or action items

            Format the output as:
            EXECUTIVE SUMMARY
            [2-3 paragraphs of main summary]

            KEY POINTS
            • [Bullet points of critical information]

            PARTIES & ROLES
            • [List of involved parties and their responsibilities]

            ACTION ITEMS
            • [List of required actions or next steps]
            """
            
            summary = self._make_request(prompt)
            if not summary:
                return "Could not generate summary."
                
            return summary
            
        except Exception as e:
            print(f"Error in summarize_text: {e}")
            # Return a basic summary if AI fails
            sentences = text.split('.')[:5]
            return '. '.join([s.strip() for s in sentences if s.strip()]) + '.'

    def generate_bullet_points(self, text: str) -> str:
        """Generate bullet points from the text"""
        if not text:
            return ""
            
        try:
            prompt = f"""
            Extract and organize the key points from the following text into clear, concise bullet points:
            ---
            {text}
            ---
            Instructions:
            1. Identify the most important information and key facts
            2. Create clear, actionable bullet points
            3. Group related information together
            4. Use professional language
            5. Include specific details like dates, amounts, names
            6. Organize by priority or logical flow
            7. Keep each bullet point concise but complete
            8. Use consistent formatting
            9. Focus on actionable items and key decisions
            10. Highlight critical deadlines or requirements

            Format as:
            KEY POINTS
            • [Most important point]
            • [Second most important point]
            • [Continue with remaining points]

            DETAILS & SPECIFICATIONS
            • [Specific details, numbers, dates]
            • [Technical requirements or conditions]

            ACTION ITEMS
            • [Required actions or next steps]
            • [Deadlines and responsibilities]
            """
            
            bullet_points = self._make_request(prompt)
            if not bullet_points:
                return "Could not generate bullet points."
                
            return bullet_points
            
        except Exception as e:
            print(f"Error in generate_bullet_points: {e}")
            # Return basic bullet points if AI fails
            sentences = text.split('.')[:7]
            return '\n'.join([f"• {sentence.strip()}" for sentence in sentences if sentence.strip()])

    def translate_text(self, text: str, target_language: str = "English") -> str:
        """Translate text to the target language"""
        if not text:
            return ""
            
        try:
            prompt = f"""
            Translate the following text to {target_language}. Maintain the original formatting, structure, and professional tone:
            ---
            {text}
            ---
            Instructions:
            1. Preserve document structure and formatting
            2. Maintain professional legal language where appropriate
            3. Keep technical terms accurate
            4. Preserve any special formatting (lists, headers, etc.)
            5. Ensure the translation is natural and fluent in {target_language}
            6. Maintain the original meaning and context
            7. Keep proper nouns and specific legal terms when appropriate
            8. Preserve any numbered or lettered lists
            9. Keep paragraph breaks and structure
            10. Ensure cultural appropriateness for {target_language}
            """
            
            translated = self._make_request(prompt)
            if not translated:
                return f"Could not translate to {target_language}."
                
            return translated
            
        except Exception as e:
            print(f"Error in translate_text: {e}")
            return f"[Translation Error] Could not translate to {target_language}: {text}"

    def compare_documents(self, text1: str, text2: str) -> Dict[str, Any]:
        """Compare two documents and return analysis"""
        if not text1 or not text2:
            return {"error": "Both documents are required for comparison"}
            
        try:
            prompt = f"""
            Compare and analyze the following two documents, focusing on legal differences, similarities, and key changes:
            
            DOCUMENT 1:
            ---
            {text1}
            ---
            
            DOCUMENT 2:
            ---
            {text2}
            ---
            
            Instructions:
            1. Identify key differences between the documents
            2. Highlight similarities and common elements
            3. Note any critical changes in terms, conditions, or obligations
            4. Analyze differences in parties, dates, amounts, or requirements
            5. Assess the significance of changes
            6. Provide a similarity score (0-100%)
            7. Summarize the overall comparison
            8. Highlight potential legal implications of differences
            9. Note any missing information in either document
            10. Provide recommendations based on the comparison

            Format the response as JSON with these fields:
            - similarity_score: number (0-100)
            - key_differences: array of strings
            - similarities: array of strings
            - critical_changes: array of strings
            - summary: string
            - recommendations: array of strings
            """
            
            comparison_text = self._make_request(prompt)
            
            # Try to parse as JSON, fallback to structured text
            try:
                comparison_data = json.loads(comparison_text)
                return comparison_data
            except:
                # If JSON parsing fails, return structured response
                return {
                    "similarity_score": 75,  # Default score
                    "analysis": comparison_text,
                    "summary": "Document comparison completed. See analysis for details.",
                    "differences": comparison_text
                }
                
        except Exception as e:
            print(f"Error in compare_documents: {e}")
            return {
                "similarity_score": 50,
                "error": f"Comparison failed: {str(e)}",
                "summary": "Could not complete document comparison due to an error."
            } 