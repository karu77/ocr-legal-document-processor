import pytest
import os
import json
from io import BytesIO

# The base directory for sample files
SAMPLES_DIR = os.path.join(os.path.dirname(__file__), 'sample_files')

def test_process_txt_file(client):
    """Test processing a simple .txt file."""
    file_path = os.path.join(SAMPLES_DIR, 'test.txt')
    with open(file_path, 'rb') as f:
        data = {
            'file': (f, 'test.txt')
        }
        response = client.post('/api/process', data=data, content_type='multipart/form-data')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert 'The quick brown fox' in json_data['extracted_text']
    assert json_data['filename'] == 'test.txt'

def test_process_html_file(client):
    """Test processing a .html file, ensuring script tags are ignored."""
    file_path = os.path.join(SAMPLES_DIR, 'test.html')
    with open(file_path, 'rb') as f:
        data = {
            'file': (f, 'test.html')
        }
        response = client.post('/api/process', data=data, content_type='multipart/form-data')

    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert 'This is a heading' in json_data['extracted_text']
    assert 'This is a paragraph' in json_data['extracted_text']
    assert 'This should not be in the output' not in json_data['extracted_text']

def test_process_csv_file(client):
    """Test processing a .csv file."""
    file_path = os.path.join(SAMPLES_DIR, 'test.csv')
    with open(file_path, 'rb') as f:
        data = {
            'file': (f, 'test.csv')
        }
        response = client.post('/api/process', data=data, content_type='multipart/form-data')

    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert 'First Item' in json_data['extracted_text']
    assert 'Third, with comma' in json_data['extracted_text']
    assert '100' in json_data['extracted_text']

def test_unsupported_file_type(client):
    """Test uploading a file type that is not supported."""
    data = {
        'file': (BytesIO(b"some data"), 'test.zip')
    }
    response = client.post('/api/process', data=data, content_type='multipart/form-data')
    assert response.status_code == 400
    json_data = json.loads(response.data)
    assert json_data['success'] is False
    assert 'File type not supported' in json_data['error']

def test_process_pdf_file(client):
    """Test processing a PDF file (requires sample)."""
    file_path = os.path.join(SAMPLES_DIR, 'test.pdf')
    if not os.path.exists(file_path):
        pytest.fail("Sample file 'test.pdf' not found.")
        
    with open(file_path, 'rb') as f:
        data = {'file': (f, 'test.pdf')}
        response = client.post('/api/process', data=data, content_type='multipart/form-data')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    # Add a specific assertion based on your test PDF's content
    assert len(json_data['extracted_text']) > 20  # Reduced threshold for simple test PDF 

def test_process_docx_file(client):
    """Test processing a DOCX file (requires sample)."""
    file_path = os.path.join(SAMPLES_DIR, 'test.docx')
    if not os.path.exists(file_path):
        pytest.fail("Sample file 'test.docx' not found.")
        
    with open(file_path, 'rb') as f:
        data = {'file': (f, 'test.docx')}
        response = client.post('/api/process', data=data, content_type='multipart/form-data')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    # Add a specific assertion based on your test DOCX's content
    assert len(json_data['extracted_text']) > 50

def test_process_image_file(client):
    """Test processing an image file (requires sample)."""
    file_path = os.path.join(SAMPLES_DIR, 'test.png')
    if not os.path.exists(file_path):
        pytest.fail("Sample file 'test.png' not found.")
        
    with open(file_path, 'rb') as f:
        data = {'file': (f, 'test.png')}
        response = client.post('/api/process', data=data, content_type='multipart/form-data')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    # Add a specific assertion based on your test image's content
    assert len(json_data['extracted_text']) > 10 