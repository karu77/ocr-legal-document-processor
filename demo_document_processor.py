#!/usr/bin/env python3
"""
Demo script for the Enhanced OCR Legal Document Processor
Demonstrates the new modular document ingestion system
"""

import os
import sys
import json
from pathlib import Path

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from utils.document_processor import document_processor, serialize_extracted_content

def demo_single_document(file_path: str):
    """Demonstrate processing a single document"""
    print(f"\n🔍 Processing: {file_path}")
    print("=" * 50)
    
    try:
        # Check if file is supported
        if not document_processor.is_supported(file_path):
            print(f"❌ File type not supported: {Path(file_path).suffix}")
            return
        
        # Process the document
        result = document_processor.process_document(file_path)
        
        # Display results
        print(f"✅ Successfully processed: {result.metadata.filename}")
        print(f"📄 File type: {result.metadata.file_type}")
        print(f"📏 File size: {result.metadata.file_size:,} bytes")
        print(f"🌍 Language: {result.metadata.language or 'Unknown'}")
        print(f"📊 Word count: {result.metadata.word_count}")
        print(f"🔧 Processing method: {result.processing_method}")
        
        if result.ocr_confidence:
            print(f"🎯 OCR confidence: {result.ocr_confidence:.1f}%")
        
        if result.tables:
            print(f"📋 Tables found: {len(result.tables)}")
            for i, table in enumerate(result.tables):
                print(f"   Table {i+1}: {table['rows']} rows × {table['columns']} columns")
        
        # Show first 200 characters of extracted text
        text_preview = result.text[:200] + "..." if len(result.text) > 200 else result.text
        print(f"\n📝 Text preview:\n{text_preview}")
        
        if result.errors:
            print(f"\n⚠️  Warnings/Errors:")
            for error in result.errors:
                print(f"   - {error}")
    
    except Exception as e:
        print(f"❌ Error processing file: {str(e)}")

def demo_multiple_documents(file_paths: list):
    """Demonstrate batch processing of multiple documents"""
    print(f"\n📚 Batch processing {len(file_paths)} documents")
    print("=" * 50)
    
    try:
        results = document_processor.process_multiple_documents(file_paths)
        
        successful = [r for r in results if not r.errors or len(r.errors) == 0]
        failed = [r for r in results if r.errors and len(r.errors) > 0]
        
        print(f"✅ Successfully processed: {len(successful)}")
        print(f"❌ Failed to process: {len(failed)}")
        
        # Summary statistics
        total_words = sum(r.metadata.word_count or 0 for r in successful)
        total_tables = sum(len(r.tables) if r.tables else 0 for r in successful)
        
        print(f"📊 Total words extracted: {total_words:,}")
        print(f"📋 Total tables found: {total_tables}")
        
        # Show details for each file
        for result in results:
            status = "✅" if not result.errors else "❌"
            print(f"{status} {result.metadata.filename} ({result.metadata.file_type})")
    
    except Exception as e:
        print(f"❌ Error in batch processing: {str(e)}")

def demo_supported_formats():
    """Show all supported file formats"""
    print("\n🎯 Supported File Formats")
    print("=" * 50)
    
    formats = document_processor.get_supported_formats()
    
    # Group by category
    categories = {
        "Documents": ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
        "Presentations": ['.ppt', '.pptx'],
        "Spreadsheets": ['.xls', '.xlsx', '.csv'],
        "Images": ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp', '.gif'],
        "Web": ['.html', '.htm', '.md'],
        "Data": ['.json', '.xml']
    }
    
    for category, extensions in categories.items():
        supported_in_category = [ext for ext in extensions if ext in formats]
        if supported_in_category:
            print(f"\n{category}:")
            for ext in supported_in_category:
                print(f"  ✅ {ext}")

def demo_api_response(file_path: str):
    """Demonstrate API response format"""
    print(f"\n🌐 API Response Format for: {Path(file_path).name}")
    print("=" * 50)
    
    try:
        result = document_processor.process_document(file_path)
        serialized = serialize_extracted_content(result)
        
        # Pretty print the JSON response
        print(json.dumps(serialized, indent=2, default=str)[:1000] + "...")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def main():
    """Main demo function"""
    print("🚀 Enhanced OCR Legal Document Processor Demo")
    print("=" * 60)
    
    # Show supported formats
    demo_supported_formats()
    
    # Find sample files
    sample_files = []
    test_files_dir = Path("backend/tests/files")
    
    if test_files_dir.exists():
        sample_files = list(test_files_dir.glob("*.*"))
        print(f"\n📁 Found {len(sample_files)} sample files in {test_files_dir}")
    
    # Demo individual file processing
    for file_path in sample_files[:3]:  # Process first 3 files
        demo_single_document(str(file_path))
    
    # Demo batch processing
    if len(sample_files) > 1:
        demo_multiple_documents([str(f) for f in sample_files])
    
    # Demo API response format
    if sample_files:
        demo_api_response(str(sample_files[0]))
    
    print("\n" + "=" * 60)
    print("✨ Demo completed! The system is ready for production use.")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r backend/requirements.txt")
    print("2. Run tests: python -m pytest backend/tests/ -v")
    print("3. Start the API server")
    print("4. Upload documents via the web interface or API")

if __name__ == "__main__":
    main() 