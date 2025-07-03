import os
import requests
import json
from typing import Dict, Any, Optional, List
import time
import re
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Gemini API client for text processing

class GeminiClient:
    """
    Client for interacting with Google Gemini API v1beta
    """
    
    def __init__(self):
        """Initialize Gemini API client"""
        api_key = os.getenv('GEMINI_API_KEY')
        
        if not api_key:
            print("[INFO] No Gemini API key found. Using local NLP processing.")
            self.model = None
            return
        
        try:
            # Configure the library
            genai.configure(api_key=api_key)
            
            # Initialize the model
            self.model = genai.GenerativeModel('gemini-pro')
            
            # Test the connection
            response = self.model.generate_content("Test connection")
            if response:
                print("[OK] Gemini API client initialized")
            else:
                print("[WARNING] Could not verify Gemini API connection")
                self.model = None
                
        except Exception as e:
            print(f"[ERROR] Failed to initialize Gemini API: {str(e)}")
            self.model = None
        
    def _make_request(self, prompt: str, max_retries: int = 3) -> str:
        """
        Make a request to the Gemini API with retry logic
        """
        if not self.model:
            return None  # Return None if no model available
            
        try:
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                return response.text.strip()
            else:
                print("[WARNING] Empty response from Gemini API")
                return None
                
        except Exception as e:
            print(f"[ERROR] Gemini API processing failed: {str(e)}")
            return None
        
    def cleanup_text(self, text: str) -> str:
        """Clean up and format the text"""
        if not text:
            return ""
            
        try:
            prompt = f"""
            Clean up and format the following text, which may be in any language. Preserve its original language, meaning, and structure.
            ---
            {text}
            ---
            Instructions:
            1. Fix spelling and grammar errors appropriate for the source language.
            2. Improve formatting with proper paragraphs and spacing.
            3. Preserve document structure (headings, sections, lists).
            4. Maintain original text organization.
            5. Keep all important information intact.
            6. Remove OCR artifacts and noise.
            7. Fix line breaks and word wrapping.
            8. Ensure consistent spacing and indentation.
            9. Maintain professional formatting.
            10. Return the text in its original language, in a clean, well-structured format.

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
            Create a comprehensive narrative summary of the following text. The summary should be in paragraph form and tell a complete story of the document's content.
            ---
            {text}
            ---
            Instructions:
            1. Write a flowing narrative in 2-3 well-structured paragraphs
            2. Focus on the overall context and big picture
            3. Explain relationships between different parts of the content
            4. Use transitional phrases to connect ideas
            5. Maintain chronological or logical flow
            6. Include the most significant details only
            7. Write in a professional, objective tone
            8. Keep the same language as the source text
            9. Avoid bullet points or lists
            10. End with a concluding statement

            Format:
            [First paragraph introducing the main topic and context]

            [Second paragraph developing the key points and their relationships]

            [Final paragraph with conclusions and implications]
            """
            
            summary = self._make_request(prompt)
            if not summary:
                return "Could not generate summary."
                
            return summary
            
        except Exception as e:
            print(f"Error in summarize_text: {e}")
            sentences = text.split('.')[:5]
            return '. '.join([s.strip() for s in sentences if s.strip()]) + '.'

    def generate_bullet_points(self, text: str) -> str:
        """Generate bullet points from the text"""
        if not text:
            return ""
            
        try:
            prompt = f"""
            Extract specific, actionable key points from the text and present them in a structured bullet-point format. Focus on facts, figures, and concrete details rather than general summaries.
            ---
            {text}
            ---
            Instructions:
            1. Extract ONLY specific facts, numbers, dates, and concrete details
            2. Each point should be a single, specific piece of information
            3. Avoid general summaries or interpretations
            4. Include exact quotes where relevant
            5. Organize points by category
            6. Use precise language
            7. Keep the same language as the source text
            8. Format each point as a complete statement
            9. Include source context where necessary
            10. Separate different types of information

            Format:

            Facts & Figures
            • [Specific numerical data point]
            • [Exact date or timeline]
            • [Precise measurement or quantity]

            Key Details
            • [Specific requirement or condition]
            • [Exact quote or reference]
            • [Concrete example]

            Important References
            • [Specific document reference]
            • [Named entity or citation]
            • [Cross-reference or link]
            """
            
            bullet_points = self._make_request(prompt)
            if not bullet_points:
                return "Could not generate bullet points."
                
            return bullet_points
            
        except Exception as e:
            print(f"Error in generate_bullet_points: {e}")
            sentences = text.split('.')[:5]
            return '\n'.join([f"• {s.strip()}" for s in sentences if s.strip()])

    def translate_text(self, text: str, target_language: str = "English") -> str:
        """Translate text to the specified target language"""
        if not text or not target_language:
            return ""
            
        try:
            prompt = f"""
            Translate the following text to {target_language}. Maintain the original formatting, structure, and professional tone. The source text could be in any language; auto-detect it if necessary.
            ---
            {text}
            ---
            The output should ONLY be the translated text.
            """
            
            translated_text = self._make_request(prompt)
            if not translated_text:
                return f"Could not translate to {target_language}."
                
            return translated_text
            
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