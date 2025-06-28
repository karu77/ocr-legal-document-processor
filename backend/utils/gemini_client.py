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
            
            # Check if CUDA is available for GPU acceleration
            try:
                import torch
                self.device = 0 if torch.cuda.is_available() else -1
                if self.device == 0:
                    print(f"🚀 GPU acceleration enabled: {torch.cuda.get_device_name(0)}")
                else:
                    print("⚠️  Using CPU-only mode. Performance may be slower.")
            except:
                self.device = -1
                print("⚠️  Using CPU-only mode. Performance may be slower.")
            
            # Multilingual translation model (NLLB-200) with optimizations
            print("Loading translation model (this may take a moment)...")
            self.translator = pipeline(
                "translation", 
                model="facebook/nllb-200-distilled-600M",
                device=self.device,
                model_kwargs={"torch_dtype": "auto", "low_cpu_mem_usage": True}
            )
            
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

            # Lazy load other models for faster startup
            print("📦 Other models will be loaded on-demand for better performance")
            self.summarizer = None
            self.text_generator = None 
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

    def _get_summarizer(self):
        """Lazy load summarizer model for better performance"""
        if self.summarizer is None:
            print("Loading summarization model...")
            self.summarizer = pipeline(
                "summarization", 
                model="sshleifer/distilbart-cnn-12-6",
                device=self.device,
                model_kwargs={"torch_dtype": "auto", "low_cpu_mem_usage": True}
            )
            print("✅ Summarization model loaded")
        return self.summarizer

    def _get_text_generator(self):
        """Lazy load text generator model for better performance"""
        if self.text_generator is None:
            print("Loading text generation model...")
            self.text_generator = pipeline(
                "text-generation", 
                model="distilgpt2",
                device=self.device,
                model_kwargs={"torch_dtype": "auto", "low_cpu_mem_usage": True}
            )
            print("✅ Text generation model loaded")
        return self.text_generator
        
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
        Optimized text chunking for better performance.
        """
        # Reduce chunk size for faster processing
        effective_chunk_length = min(max_chunk_length, 256)
        
        def _split_into_paragraphs(long_text: str) -> List[str]:
            return [p.strip() for p in long_text.split('\n\n') if p.strip()]

        def _split_into_sentences_simple(paragraph: str) -> List[str]:
            return [s.strip() for s in re.split(r'(?<=[.!?])\s+', paragraph) if s.strip()]

        refined_chunks = []
        paragraphs = _split_into_paragraphs(text)

        for para in paragraphs:
            # Quick length check before tokenization (performance optimization)
            if len(para) > effective_chunk_length * 4:  # Rough estimate
                sentences = _split_into_sentences_simple(para)
                current_chunk_text = []

                for sentence in sentences:
                    # Simple length-based chunking for speed
                    if len(' '.join(current_chunk_text + [sentence])) > effective_chunk_length * 4:
                        if current_chunk_text:
                            refined_chunks.append(" ".join(current_chunk_text))
                        current_chunk_text = [sentence]
                    else:
                        current_chunk_text.append(sentence)
                
                if current_chunk_text:
                    refined_chunks.append(" ".join(current_chunk_text))
            else:
                refined_chunks.append(para)

        # Limit number of chunks for performance
        if len(refined_chunks) > 5:
            print(f"⚠️  Large document detected ({len(refined_chunks)} chunks). Processing first 5 chunks for performance.")
            refined_chunks = refined_chunks[:5]

        return refined_chunks

    def translate_text(self, text: str, target_language: str = "English") -> str:
        """
        Optimized translation with performance improvements.
        """
        if self.use_local_nlp:
            target_lang_code = self.lang_codes.get(target_language.lower())
            if not target_lang_code:
                return f"Error: Unsupported target language '{target_language}' for local translation. Supported languages: {', '.join(self.lang_codes.keys())}"
            
            # Performance optimization: limit text length for faster processing
            if len(text) > 3000:
                print(f"⚠️  Large text detected ({len(text)} chars). Truncating to 3000 chars for faster processing.")
                text = text[:3000] + "..."
            
            # Get max length from the tokenizer, with a smaller fallback for speed
            try:
                max_model_length = self.translator.tokenizer.model_max_length
                if max_model_length > 100000:
                    max_model_length = 256  # Smaller chunks for faster processing
            except:
                max_model_length = 256  # Smaller fallback for speed
            
            text_chunks = self._chunk_text(text, self.translator.tokenizer, max_model_length)
            translated_chunks = []

            print(f"🔄 Processing {len(text_chunks)} chunks for translation...")
            
            for i, chunk in enumerate(text_chunks):
                try:
                    # Optimized parameters for faster translation
                    result = self.translator(
                        chunk,
                        src_lang="eng_Latn",
                        tgt_lang=target_lang_code,
                        max_length=max_model_length,
                        num_beams=2,  # Reduced from 4 for speed
                        early_stopping=True,
                        do_sample=False  # Faster than sampling
                    )
                    translated_chunks.append(result[0]['translation_text'].strip())
                    print(f"  ✅ Chunk {i+1}/{len(text_chunks)} completed")
                except Exception as e:
                    print(f"  ❌ Error translating chunk {i+1}: {e}")
                    translated_chunks.append(f"[Translation Error for chunk {i+1}]")
            
            print(f"🎉 Translation completed!")
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
            text_generator = self._get_text_generator()
            
            # Performance optimization: limit text length
            if len(text) > 2000:
                print(f"⚠️  Large text detected. Truncating to 2000 chars for faster processing.")
                text = text[:2000] + "..."
            
            # Get max length from the tokenizer, with a fallback
            try:
                max_model_length = text_generator.tokenizer.model_max_length
                if max_model_length > 100000:
                    max_model_length = 512  # Smaller for faster processing
            except:
                max_model_length = 512
            text_chunks = self._chunk_text(text, text_generator.tokenizer, max_model_length)
            
            cleaned_chunks = []
            print(f"🔄 Processing {len(text_chunks)} chunks for cleanup...")
            
            for i, chunk in enumerate(text_chunks):
                cleanup_prompt_for_chunk = f"Clean this text: {chunk}\nCleaned:"
                try:
                    result = text_generator(
                        cleanup_prompt_for_chunk, 
                        max_length=len(text_generator.tokenizer.encode(chunk)) + 100,
                        num_return_sequences=1,
                        do_sample=False,
                        temperature=0.1
                    )
                    generated_text = result[0]['generated_text'].replace(cleanup_prompt_for_chunk, '').strip()
                    cleaned_chunks.append(generated_text)
                    print(f"  ✅ Cleanup chunk {i+1}/{len(text_chunks)} completed")
                except Exception as e:
                    print(f"  ❌ Error cleaning chunk {i+1}: {e}")
                    cleaned_chunks.append(chunk)  # Return original on error
            
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
            summarizer = self._get_summarizer()
            
            # Performance optimization: limit text length
            if len(text) > 3000:
                print(f"⚠️  Large text detected. Truncating to 3000 chars for faster processing.")
                text = text[:3000] + "..."
            
            # Get max length from the tokenizer, with a fallback
            try:
                max_model_length = summarizer.tokenizer.model_max_length
                if max_model_length > 100000:
                    max_model_length = 512  # Smaller for faster processing
            except:
                max_model_length = 512
            text_chunks = self._chunk_text(text, summarizer.tokenizer, max_model_length)
            
            all_summaries = []
            print(f"🔄 Processing {len(text_chunks)} chunks for summarization...")
            
            for i, chunk in enumerate(text_chunks):
                try:
                    result = summarizer(
                        chunk, 
                        max_length=100,  # Shorter for speed
                        min_length=20, 
                        do_sample=False,
                        length_penalty=1.0
                    )
                    all_summaries.append(result[0]['summary_text'].strip())
                    print(f"  ✅ Summary chunk {i+1}/{len(text_chunks)} completed")
                except Exception as e:
                    print(f"  ❌ Error summarizing chunk {i+1}: {e}")
                    all_summaries.append(f"[Summarization Error for chunk {i+1}]")
            
            return "\n\n".join(all_summaries)
        else:
            prompt = f"""Summarize the following text concisely. Focus on the main points and key information. Ensure the summary is clear, coherent, and significantly shorter than the original text.\n\nText:\n{text}\n\nSummary:"""
            
            return self._make_request(prompt)

    def generate_bullet_points(self, text: str) -> str:
        """
        Generate bullet points from text using Gemini API or local model.
        """
        if self.use_local_nlp:
            text_generator = self._get_text_generator()
            
            # Performance optimization: limit text length
            if len(text) > 2000:
                print(f"⚠️  Large text detected. Truncating to 2000 chars for faster processing.")
                text = text[:2000] + "..."
            
            # Get max length from the tokenizer, with a fallback
            try:
                max_model_length = text_generator.tokenizer.model_max_length
                if max_model_length > 100000:
                    max_model_length = 512  # Smaller for faster processing
            except:
                max_model_length = 512
            text_chunks = self._chunk_text(text, text_generator.tokenizer, max_model_length)
            
            all_bullet_points = []
            print(f"🔄 Processing {len(text_chunks)} chunks for bullet points...")
            
            for i, chunk in enumerate(text_chunks):
                prompt = f"Key points from this text:\n{chunk}\n\n• "
                try:
                    result = text_generator(
                        prompt, 
                        max_length=150, 
                        num_return_sequences=1,
                        do_sample=False,
                        temperature=0.1
                    )
                    generated_text = result[0]['generated_text'].replace(prompt, '').strip()
                    all_bullet_points.append("• " + generated_text)
                    print(f"  ✅ Bullet points chunk {i+1}/{len(text_chunks)} completed")
                except Exception as e:
                    print(f"  ❌ Error generating bullet points for chunk {i+1}: {e}")
                    all_bullet_points.append(f"• [Error processing chunk {i+1}]")

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