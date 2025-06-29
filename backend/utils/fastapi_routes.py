from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Union
import tempfile
import os
import uuid
import logging
from pathlib import Path
import json

from .document_processor import document_processor, ExtractedContent, DocumentMetadata
from .auth import optional_auth

# Setup logging
logger = logging.getLogger(__name__)

# Create FastAPI app
fastapi_app = FastAPI(
    title="OCR Legal Document Processor API",
    description="Advanced document ingestion system supporting multiple file formats",
    version="2.0.0"
)

# Add CORS middleware
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File size limit (20MB)
MAX_FILE_SIZE = 20 * 1024 * 1024

def serialize_extracted_content(content: ExtractedContent) -> dict:
    """Serialize ExtractedContent to JSON-compatible dict"""
    return {
        "text": content.text,
        "metadata": {
            "filename": content.metadata.filename,
            "file_type": content.metadata.file_type,
            "mime_type": content.metadata.mime_type,
            "file_size": content.metadata.file_size,
            "language": content.metadata.language,
            "page_count": content.metadata.page_count,
            "creation_date": content.metadata.creation_date.isoformat() if content.metadata.creation_date else None,
            "modification_date": content.metadata.modification_date.isoformat() if content.metadata.modification_date else None,
            "author": content.metadata.author,
            "title": content.metadata.title,
            "subject": content.metadata.subject,
            "word_count": content.metadata.word_count,
            "character_count": content.metadata.character_count,
        },
        "tables": content.tables,
        "images": content.images,
        "raw_content": content.raw_content,
        "ocr_confidence": content.ocr_confidence,
        "processing_method": content.processing_method,
        "errors": content.errors,
    }

@fastapi_app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "OCR Legal Document Processor API v2.0",
        "supported_formats": document_processor.get_supported_formats(),
        "endpoints": {
            "process_document": "/api/v2/process",
            "process_multiple": "/api/v2/process/batch",
            "supported_formats": "/api/v2/formats",
            "health": "/api/v2/health"
        }
    }

@fastapi_app.get("/api/v2/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "OCR Legal Document Processor API v2.0 is running",
        "supported_formats": len(document_processor.get_supported_formats())
    }

@fastapi_app.get("/api/v2/formats")
async def get_supported_formats():
    """Get list of supported file formats"""
    return {
        "supported_formats": document_processor.get_supported_formats(),
        "format_details": {
            "pdf": "Portable Document Format (text + OCR for scanned)",
            "docx": "Microsoft Word Document",
            "doc": "Legacy Microsoft Word Document",
            "txt": "Plain Text File",
            "rtf": "Rich Text Format",
            "pptx": "Microsoft PowerPoint Presentation",
            "xlsx": "Microsoft Excel Spreadsheet",
            "xls": "Legacy Microsoft Excel Spreadsheet",
            "csv": "Comma Separated Values",
            "jpg": "JPEG Image (OCR)",
            "jpeg": "JPEG Image (OCR)",
            "png": "PNG Image (OCR)",
            "tiff": "TIFF Image (OCR)",
            "tif": "TIFF Image (OCR)",
            "bmp": "Bitmap Image (OCR)",
            "gif": "GIF Image (OCR)",
            "html": "HTML Web Page",
            "htm": "HTML Web Page",
            "md": "Markdown Document",
            "json": "JSON Data File",
            "xml": "XML Data File"
        }
    }

@fastapi_app.post("/api/v2/process")
async def process_single_document(
    file: UploadFile = File(...),
    extract_tables: bool = Form(True),
    extract_metadata: bool = Form(True),
    ocr_language: str = Form("en")
):
    """
    Process a single document and extract text, metadata, and tables
    
    Args:
        file: The document file to process
        extract_tables: Whether to extract tables (default: True)
        extract_metadata: Whether to extract metadata (default: True)
        ocr_language: Language for OCR processing (default: "en")
    
    Returns:
        JSON response with extracted content
    """
    
    # Validate file size
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024):.1f}MB"
        )
    
    # Check if file is empty
    if file.size == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    file_ext = Path(file.filename).suffix.lower()
    if not document_processor.is_supported(file.filename):
        supported = document_processor.get_supported_formats()
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file_ext}'. Supported formats: {', '.join(supported)}"
        )
    
    # Save file temporarily
    temp_dir = tempfile.gettempdir()
    temp_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_path = os.path.join(temp_dir, temp_filename)
    
    try:
        # Write uploaded file to temporary location
        with open(temp_path, "wb") as temp_file:
            content = await file.read()
            temp_file.write(content)
        
        # Process the document
        try:
            result = document_processor.process_document(temp_path, file.filename)
            
            # Serialize the result
            response_data = serialize_extracted_content(result)
            response_data["success"] = True
            response_data["filename"] = file.filename
            
            return JSONResponse(content=response_data)
            
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except FileNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            logger.error(f"Error processing document {file.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning(f"Failed to remove temporary file {temp_path}: {str(e)}")

@fastapi_app.post("/api/v2/process/batch")
async def process_multiple_documents(
    files: List[UploadFile] = File(...),
    extract_tables: bool = Form(True),
    extract_metadata: bool = Form(True),
    ocr_language: str = Form("en")
):
    """
    Process multiple documents and extract text, metadata, and tables
    
    Args:
        files: List of document files to process
        extract_tables: Whether to extract tables (default: True)
        extract_metadata: Whether to extract metadata (default: True)
        ocr_language: Language for OCR processing (default: "en")
    
    Returns:
        JSON response with extracted content for all files
    """
    
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    if len(files) > 10:  # Limit batch processing
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed per batch")
    
    results = []
    temp_files = []
    
    try:
        # Save all files temporarily
        for file in files:
            # Validate file size
            if file.size and file.size > MAX_FILE_SIZE:
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024):.1f}MB"
                })
                continue
            
            # Check if file is empty
            if file.size == 0:
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": "Empty file"
                })
                continue
            
            # Validate file type
            if not file.filename or not document_processor.is_supported(file.filename):
                file_ext = Path(file.filename).suffix.lower() if file.filename else "unknown"
                supported = document_processor.get_supported_formats()
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": f"Unsupported file type '{file_ext}'. Supported formats: {', '.join(supported)}"
                })
                continue
            
            # Save file temporarily
            temp_dir = tempfile.gettempdir()
            temp_filename = f"{uuid.uuid4()}_{file.filename}"
            temp_path = os.path.join(temp_dir, temp_filename)
            
            try:
                with open(temp_path, "wb") as temp_file:
                    content = await file.read()
                    temp_file.write(content)
                
                temp_files.append((temp_path, file.filename))
                
            except Exception as e:
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": f"Failed to save file: {str(e)}"
                })
        
        # Process all saved files
        for temp_path, filename in temp_files:
            try:
                result = document_processor.process_document(temp_path, filename)
                
                # Serialize the result
                response_data = serialize_extracted_content(result)
                response_data["success"] = True
                response_data["filename"] = filename
                
                results.append(response_data)
                
            except Exception as e:
                logger.error(f"Error processing document {filename}: {str(e)}")
                results.append({
                    "filename": filename,
                    "success": False,
                    "error": f"Processing failed: {str(e)}"
                })
    
    finally:
        # Clean up all temporary files
        for temp_path, _ in temp_files:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception as e:
                    logger.warning(f"Failed to remove temporary file {temp_path}: {str(e)}")
    
    return JSONResponse(content={
        "success": True,
        "processed_count": len([r for r in results if r.get("success")]),
        "failed_count": len([r for r in results if not r.get("success")]),
        "results": results
    })

@fastapi_app.post("/api/v2/validate")
async def validate_file(file: UploadFile = File(...)):
    """
    Validate if a file can be processed without actually processing it
    
    Args:
        file: The file to validate
    
    Returns:
        JSON response with validation result
    """
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Check file size
    if file.size and file.size > MAX_FILE_SIZE:
        return JSONResponse(content={
            "valid": False,
            "error": f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024):.1f}MB",
            "filename": file.filename
        })
    
    # Check if file is empty
    if file.size == 0:
        return JSONResponse(content={
            "valid": False,
            "error": "Empty file",
            "filename": file.filename
        })
    
    # Check file type
    file_ext = Path(file.filename).suffix.lower()
    is_supported = document_processor.is_supported(file.filename)
    
    if is_supported:
        return JSONResponse(content={
            "valid": True,
            "filename": file.filename,
            "file_type": file_ext,
            "file_size": file.size,
            "estimated_processing_time": "1-30 seconds"  # Rough estimate
        })
    else:
        supported = document_processor.get_supported_formats()
        return JSONResponse(content={
            "valid": False,
            "error": f"Unsupported file type '{file_ext}'. Supported formats: {', '.join(supported)}",
            "filename": file.filename
        })

# Error handlers
@fastapi_app.exception_handler(413)
async def request_entity_too_large_handler(request, exc):
    return JSONResponse(
        status_code=413,
        content={
            "success": False,
            "error": f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024):.1f}MB"
        }
    )

@fastapi_app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    logger.error(f"Internal server error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error occurred"
        }
    ) 