import os
import requests
import json
from typing import Dict, Any, Optional, List
import time
import re

# Import transformers if local NLP is enabled
try:
    from transformers import pipeline, set_seed
    # set_seed(42) # Optional: for reproducibility
except ImportError:
    pipeline = None
    set_seed = None
    print("Warning: transformers library not found. Local NLP features will be unavailable unless it's installed.")

class GeminiClient:
    """
    Client for interacting with Google Gemini API v1beta or local NLP models.
    """
    
    def __init__(self):
        self.use_local_nlp = os.getenv('USE_LOCAL_NLP', 'false').lower() == 'true'

        if self.use_local_nlp:
            if pipeline is None:
                raise ImportError("transformers library is required for local NLP but not found.")
            print("Initializing local NLP models (transformers). Gemini API will not be used.")
            
            # Multilingual translation model (NLLB-200)
            self.translator = pipeline("translation", model="facebook/nllb-200-distilled-600M")
            
            # Language code mapping for NLLB-200
            self.lang_codes = {
                "english": "eng_Latn",
                "french": "fra_Latn",
                "spanish": "spa_Latn",
                "german": "deu_Latn",
                "italian": "ita_Latn",
                "portuguese": "por_Latn",
                "russian": "rus_Cyrl",
                "chinese": "zho_Hans",
                "japanese": "jpn_Jpan",
                "korean": "kor_Hang",
                "arabic": "arb_Arab",
                "hindi": "hin_Deva",
                "bengali": "ben_Beng",
                "gujarati": "guj_Gujr",
                "kannada": "kan_Knda",
                "malayalam": "mal_Mlym",
                "marathi": "mar_Deva",
                "oriya": "ory_Orya",
                "punjabi": "pan_Guru",
                "tamil": "tam_Taml",
                "telugu": "tel_Telu",
                "urdu": "urd_Arab",
                "assamese": "asm_Beng",
                "nepali": "npi_Deva",
                "sinhala": "sin_Sinh",
                # Add more languages as needed
            }

            # Summarization and text generation models remain the same
            self.summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6") 
            self.text_generator = pipeline("text-generation", model="distilgpt2") 
        else:
            self.api_key = os.getenv('GEMINI_API_KEY')
            if not self.api_key:
                raise ValueError("GEMINI_API_KEY environment variable is not set. Set USE_LOCAL_NLP=true to use local models.")
            
            self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
            self.headers = {
                'Content-Type': 'application/json',
            }
            self.timeout = 30  # seconds
            print("Initializing Gemini API client.")
        
    def _make_request(self, prompt: str, max_retries: int = 3) -> str:
        """
        Make a request to the Gemini API with retry logic, or process locally.
        """
        if self.use_local_nlp:
            return "Local NLP processing not handled by _make_request directly. Refer to specific methods."
        else:
            url = f"{self.base_url}?key={self.api_key}"
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
        
    def _chunk_text(self, text: str, tokenizer, max_chunk_length: int) -> List[str]:
        """
        Splits text into chunks that fit the model's max_length, prioritizing
        splitting at natural breaks (paragraphs, then sentences), and finally
        word boundaries if necessary.
        """
        def _split_into_paragraphs(long_text: str) -> List[str]:
            return [p.strip() for p in long_text.split('\n\n') if p.strip()]

        def _split_into_sentences_simple(paragraph: str) -> List[str]:
            # A very basic sentence splitter - will handle . ? !
            return [s.strip() for s in re.split(r'(?<=[.!?])\s+', paragraph) if s.strip()]

        refined_chunks = []
        paragraphs = _split_into_paragraphs(text)

        for para in paragraphs:
            # Check approximate token count for the paragraph
            para_tokens = tokenizer.encode(para, add_special_tokens=False)
            
            if len(para_tokens) > max_chunk_length:
                sentences = _split_into_sentences_simple(para)
                current_chunk_tokens = []
                current_chunk_text = []

                for sentence in sentences:
                    sentence_tokens = tokenizer.encode(sentence, add_special_tokens=False)
                    # If adding the current sentence exceeds max_chunk_length, start a new chunk
                    if len(current_chunk_tokens) + len(sentence_tokens) + (1 if current_chunk_text else 0) > max_chunk_length: 
                        if current_chunk_text:
                            refined_chunks.append(" ".join(current_chunk_text))
                        current_chunk_tokens = sentence_tokens
                        current_chunk_text = [sentence]
                    else:
                        current_chunk_tokens.extend(sentence_tokens)
                        current_chunk_text.append(sentence)
                
                if current_chunk_text:
                    refined_chunks.append(" ".join(current_chunk_text))
            else:
                refined_chunks.append(para) # Paragraph fits in one chunk

        return refined_chunks

    def translate_text(self, text: str, target_language: str = "English") -> str:
        """
        Translate text to the target language using Gemini API or local model.
        """
        if self.use_local_nlp:
            target_lang_code = self.lang_codes.get(target_language.lower())
            if not target_lang_code:
                return f"Error: Unsupported target language '{target_language}' for local translation. Supported languages: {', '.join(self.lang_codes.keys())}"
            
            # Get max length from the tokenizer, with a fallback
            try:
                max_model_length = self.translator.tokenizer.model_max_length
                if max_model_length > 100000:  # Some tokenizers return very large values
                    max_model_length = 512  # Use a reasonable default
            except:
                max_model_length = 512  # Fallback for translation
            
            text_chunks = self._chunk_text(text, self.translator.tokenizer, max_model_length)
            translated_chunks = []

            for chunk in text_chunks:
                try:
                    result = self.translator(
                        chunk,
                        src_lang="eng_Latn",
                        tgt_lang=target_lang_code,
                        max_length=max_model_length,
                        num_beams=4,
                        early_stopping=True
                    )
                    translated_chunks.append(result[0]['translation_text'].strip())
                except Exception as e:
                    print(f"Error translating chunk: {e}")
                    translated_chunks.append(f"[Translation Error for chunk: {e}]")
            
            return "\n\n".join(translated_chunks)
        else:
            prompt = f"""Translate the following text to {target_language}. 
            
If the text is already in {target_language}, please improve its clarity and grammar while maintaining the original meaning.

Preserve the formatting, structure, and legal terminology where appropriate.

Text to translate:
{text}

Translation:"""
            
            return self._make_request(prompt)
        
    def cleanup_text(self, text: str) -> str:
        """
        Clean up OCR-extracted text using Gemini API or local model.
        """
        if self.use_local_nlp:
            # Using text generation for cleanup - will try to guide it to rewrite.
            prompt = f"""Rewrite the following text, correcting spelling errors, fixing grammar, and improving readability. Do not add new information or elaborate on the text. Only provide the corrected version of the original text.
{text}
"""
            
            # Since cleanup might also involve long text, apply chunking.
            # Get max length from the tokenizer, with a fallback
            try:
                max_model_length = self.text_generator.tokenizer.model_max_length
                if max_model_length > 100000:  # Some tokenizers return very large values
                    max_model_length = 1024  # Use a reasonable default for text generation
            except:
                max_model_length = 1024  # Fallback for text generation
            text_chunks = self._chunk_text(text, self.text_generator.tokenizer, max_model_length)
            
            cleaned_chunks = []
            for chunk in text_chunks:
                cleanup_prompt_for_chunk = f"""Rewrite the following text, correcting spelling errors, fixing grammar, and improving readability. Do not add new information or elaborate on the text. Only provide the corrected version of the original text.
{chunk}
"""
                try:
                    # For cleanup, distilgpt2 is used as a generic text generator.
                    # max_length should be sufficient to rewrite the chunk.
                    result = self.text_generator(cleanup_prompt_for_chunk, max_length=len(self.text_generator.tokenizer.encode(chunk)) + 50, num_return_sequences=1) # Allow some extra tokens for correction
                    generated_text = result[0]['generated_text'].replace(cleanup_prompt_for_chunk, '').strip()
                    cleaned_chunks.append(generated_text)
                except Exception as e:
                    print(f"Error cleaning up chunk: {e}")
                    cleaned_chunks.append(f"[Cleanup Error for chunk: {e}]")
            
            return "\n\n".join(cleaned_chunks)
        else:
            prompt = f"""Rewrite the following text, correcting spelling errors, fixing grammar, and improving readability. Do not add new information or elaborate on the text. Only provide the corrected version of the original text.
{text}
"""
            return self._make_request(prompt)

    def summarize_text(self, text: str) -> str:
        """
        Summarize text using Gemini API or local model.
        """
        if self.use_local_nlp:
            # Get max length from the tokenizer, with a fallback
            try:
                max_model_length = self.summarizer.tokenizer.model_max_length
                if max_model_length > 100000:  # Some tokenizers return very large values
                    max_model_length = 1024  # Use a reasonable default for summarization
            except:
                max_model_length = 1024  # Fallback for summarization
            text_chunks = self._chunk_text(text, self.summarizer.tokenizer, max_model_length)
            
            all_summaries = []
            for chunk in text_chunks:
                try:
                    result = self.summarizer(chunk, max_length=150, min_length=30, do_sample=False)
                    all_summaries.append(result[0]['summary_text'].strip())
                except Exception as e:
                    print(f"Error summarizing chunk: {e}")
                    all_summaries.append(f"[Summarization Error for chunk: {e}]")
            
            return "\n\n".join(all_summaries)
        else:
            prompt = f"""Summarize the following text concisely. Focus on the main points and key information. Ensure the summary is clear, coherent, and significantly shorter than the original text.\n\nText:\n{text}\n\nSummary:"""
            
            return self._make_request(prompt)

    def generate_bullet_points(self, text: str) -> str:
        """
        Generate bullet points from text using Gemini API or local model.
        """
        if self.use_local_nlp:
            # Get max length from the tokenizer, with a fallback
            try:
                max_model_length = self.text_generator.tokenizer.model_max_length
                if max_model_length > 100000:  # Some tokenizers return very large values
                    max_model_length = 1024  # Use a reasonable default for text generation
            except:
                max_model_length = 1024  # Fallback for text generation
            text_chunks = self._chunk_text(text, self.text_generator.tokenizer, max_model_length)
            
            all_bullet_points = []
            for chunk in text_chunks:
                prompt = f"""Extract key points from the following text and list them as bullet points:\n{chunk}\n\nKey points:"""
                try:
                    result = self.text_generator(prompt, max_length=200, num_return_sequences=1)
                    generated_text = result[0]['generated_text'].replace(prompt, '').strip()
                    all_bullet_points.append(generated_text)
                except Exception as e:
                    print(f"Error generating bullet points for chunk: {e}")
                    all_bullet_points.append(f"[Bullet Points Error for chunk: {e}]")

            return "\n\n".join(all_bullet_points)
        else:
            prompt = f"""Extract key points from the following text and list them as bullet points:\n\nText:\n{text}\n\nKey points:"""
            
            return self._make_request(prompt)
        
    def compare_documents(self, text1: str, text2: str) -> Dict[str, Any]:
        """
        Compare two documents using Gemini API or local `difflib`.
        """
        import difflib

        if self.use_local_nlp:
            # For local comparison summary, we can use a text generation model to explain differences.
            summary_prompt = f"Compare these two documents and summarize their main differences:\nDocument 1:\n{text1}\nDocument 2:\n{text2}\nSummary:"
            summary_result = self.text_generator(summary_prompt, max_new_tokens=200, num_return_sequences=1)
            comparison_text = summary_result[0]['generated_text'].replace(summary_prompt, '', 1).strip()
        else:
            comparison_text = self._make_request(f"""Please compare the following two documents and provide a detailed analysis of their differences.\n\nPlease provide:\n1. A summary of the main differences\n2. Key changes in terms, conditions, or clauses\n3. Added content in document 2 that's not in document 1\n4. Removed content from document 1 that's not in document 2\n5. Modified sections with details about what changed\n6. Overall similarity assessment\n\nDocument 1:\n{text1}\n\nDocument 2:\n{text2}\n\nComparison Analysis:""")
        
        lines1 = text1.splitlines()
        lines2 = text2.splitlines()
        
        # Generate unified diff
        diff = list(difflib.unified_diff(
            lines1, 
            lines2, 
            fromfile='Document 1', 
            tofile='Document 2', 
            lineterm=''
        ))
        
        # Generate HTML diff for better visualization
        html_diff = difflib.HtmlDiff()
        html_comparison = html_diff.make_file(lines1, lines2, 'Document 1', 'Document 2')
        
        return {
            "summary": comparison_text,
            "detailed_diff": '\n'.join(diff),
            "html_diff": html_comparison,
            "similarity_ratio": difflib.SequenceMatcher(None, text1, text2).ratio()
        } 