import json
import pytest
import os

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

def test_translation(client, mocker):
    """Test the translation endpoint with a mocked translation service."""
    
    def mock_translation_side_effect(*args, **kwargs):
        # This mock simulates the behavior of the individual translation services
        text = kwargs.get('text') or (args[0] if args else "")
        if "Hello" in text:
            return {'success': True, 'translated_text': 'Hola, mundo.'}
        if "भारत" in text:
            return {'success': True, 'translated_text': 'India is a great country.'}
        return {'success': False, 'translated_text': ''}

    # Mock the translation services directly.
    # The new app logic will try these one by one.
    mocker.patch('backend.app.translate_with_huggingface', side_effect=mock_translation_side_effect)
    mocker.patch('backend.app.translate_with_mymemory', side_effect=mock_translation_side_effect)
    mocker.patch('backend.app.translate_with_googletrans', side_effect=mock_translation_side_effect)

    # Test English to Spanish
    test_data = {
        "text": "Hello, world.",
        "target_language": "Spanish",
        "source_language_code": "en"
    }
    response = client.post('/api/translate', json=test_data)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    # The API now returns a flat structure, so this assertion is correct.
    assert 'Hola, mundo.' in data['translated_text']

    # Test Hindi to English
    test_data_hi_en = {
        "text": "भारत एक महान देश है",
        "target_language": "English",
        "source_language_code": "hi"
    }
    response_hi_en = client.post('/api/translate', json=test_data_hi_en)
    assert response_hi_en.status_code == 200
    data_hi_en = json.loads(response_hi_en.data)
    assert data_hi_en['success'] is True
    # Check for keywords in the correctly flattened response.
    assert 'India' in data_hi_en['translated_text']
    assert 'great' in data_hi_en['translated_text']
    assert 'country' in data_hi_en['translated_text']

def test_summarize_local(client):
    """Test the summarization endpoint using the local library."""
    text = "This is a long text. It has many sentences. The goal of this text is to be summarized. Hopefully, the summary will be shorter than the original text. That is the entire point of a summary, after all. We will see if the function works as expected."
    response = client.post('/summarize', json={"text": text})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert len(data['summary']) < len(text)
    assert len(data['summary']) > 0

def test_summarize_gemini(client, mocker):
    """Test the summarization endpoint with a mocked Gemini client."""
    # Mock the helper function and the API key to force the AI path
    mocker.patch('backend.app.get_nlp_mode', return_value=False)
    mocker.patch('backend.app.gemini_client.api_key', 'mock_api_key')
    
    # Mock the Gemini client's method
    mock_gemini_summary = "This is a mocked AI summary."
    mocker.patch('backend.app.gemini_client.summarize_text', return_value=mock_gemini_summary)
    
    text = "This is a text that will be summarized by the mocked AI."
    response = client.post('/summarize', json={"text": text})
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert data['summary'] == mock_gemini_summary

def test_bullet_points_local(client):
    """Test the bullet points endpoint using the local library."""
    text = "Key points include the following: First, we must ensure quality. Second, we need to check performance. Finally, usability is a major concern."
    response = client.post('/bullet_points', json={"text": text})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'quality' in data['bullet_points']
    assert 'performance' in data['bullet_points']

def test_bullet_points_gemini(client, mocker):
    """Test the bullet points endpoint with a mocked Gemini client."""
    mocker.patch('backend.app.get_nlp_mode', return_value=False)
    mocker.patch('backend.app.gemini_client.api_key', 'mock_api_key')
    
    mock_gemini_bullets = "• Mocked AI bullet point 1\n• Mocked AI bullet point 2"
    mocker.patch('backend.app.gemini_client.generate_bullet_points', return_value=mock_gemini_bullets)
    
    text = "This is a text for which we want mocked AI bullet points."
    response = client.post('/bullet_points', json={"text": text})
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert data['bullet_points'] == mock_gemini_bullets

def test_cleanup_local(client):
    """Test the cleanup endpoint using the local library."""
    text = "  this is   a messy text.it needs cleaning. "
    response = client.post('/cleanup', json={"text": text})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert "  " not in data['cleaned_text'] # No double spaces
    assert data['cleaned_text'].startswith("this is")
    
def test_cleanup_gemini(client, mocker):
    """Test the cleanup endpoint with a mocked Gemini client."""
    mocker.patch('backend.app.get_nlp_mode', return_value=False)
    mocker.patch('backend.app.gemini_client.api_key', 'mock_api_key')
    
    mock_gemini_cleaned = "This is perfectly cleaned text."
    mocker.patch('backend.app.gemini_client.cleanup_text', return_value=mock_gemini_cleaned)
    
    text = "this is messy text for the ai"
    response = client.post('/cleanup', json={"text": text})
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert data['cleaned_text'] == mock_gemini_cleaned

def test_comparison(client):
    """Test the document comparison endpoint."""
    # Test identical texts
    comparison_data_same = {
        "text1": "This is a test.",
        "text2": "This is a test."
    }
    response_same = client.post('/api/compare', json=comparison_data_same)
    assert response_same.status_code == 200
    data_same = json.loads(response_same.data)
    assert data_same['success'] is True
    assert data_same['similarity_percentage'] == 100.0

    # Test different texts
    comparison_data_diff = {
        "text1": "The cat sat on the mat.",
        "text2": "The dog played in the yard."
    }
    response_diff = client.post('/api/compare', json=comparison_data_diff)
    assert response_diff.status_code == 200
    data_diff = json.loads(response_diff.data)
    assert data_diff['success'] is True
    assert data_diff['similarity_percentage'] < 100.0 