# Performance Optimization Guide

This guide provides comprehensive strategies to optimize the performance of your OCR Legal Document Processor.

## 🚀 Quick Performance Wins

### 1. **GPU Acceleration (Recommended)**
- **Impact**: 10-20x faster processing
- **Requirements**: NVIDIA GPU with CUDA support
- **Setup**:
  ```bash
  # Install CUDA-enabled PyTorch
  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
  
  # Optional: Install xformers for memory efficiency
  pip install xformers
  ```

### 2. **Local NLP Models (Default)**
- **Benefits**: Free, private, offline processing
- **Trade-off**: Slower than Gemini API but no costs
- **Configuration**: Set `USE_LOCAL_NLP=true` in `.env`

### 3. **Gemini API (Fastest)**
- **Benefits**: Consistently fast, cloud-powered
- **Trade-off**: Requires API key and billing
- **Configuration**: Set `USE_LOCAL_NLP=false` and add `GEMINI_API_KEY`

## 📊 Performance Comparison

| Operation | Local CPU | Local GPU | Gemini API |
|-----------|-----------|-----------|------------|
| **Translation** | 1-3 min | 15-30 sec | 5-10 sec |
| **Summarization** | 30-60 sec | 10-15 sec | 3-5 sec |
| **Text Cleanup** | 45-90 sec | 15-20 sec | 5-8 sec |
| **Bullet Points** | 30-45 sec | 10-15 sec | 3-5 sec |

## ⚙️ System Optimizations

### Hardware Requirements

#### **Minimum System**
- **CPU**: 4 cores, 2.5GHz+
- **RAM**: 8GB (4GB for models + 4GB system)
- **Storage**: 10GB free space
- **Expected Performance**: 2-5 minutes per operation

#### **Recommended System**
- **CPU**: 8+ cores, 3.0GHz+
- **RAM**: 16GB+ 
- **GPU**: NVIDIA GTX 1060+ or RTX series
- **Storage**: SSD with 20GB+ free space
- **Expected Performance**: 15-60 seconds per operation

#### **Optimal System**
- **CPU**: 12+ cores, 3.5GHz+
- **RAM**: 32GB+
- **GPU**: NVIDIA RTX 3070+ or RTX 4000 series
- **Storage**: NVMe SSD with 50GB+ free space
- **Expected Performance**: 5-30 seconds per operation

### Environment Configuration

#### **High Performance Mode**
```bash
# .env configuration for maximum speed
USE_LOCAL_NLP=true
MAX_TEXT_LENGTH_TRANSLATION=2000
MAX_TEXT_LENGTH_CLEANUP=1500
MAX_TEXT_LENGTH_SUMMARY=2500
MAX_TEXT_LENGTH_BULLETS=1500
MAX_CHUNKS_PER_OPERATION=3
```

#### **Balanced Mode (Default)**
```bash
# .env configuration for balanced performance/quality
USE_LOCAL_NLP=true
MAX_TEXT_LENGTH_TRANSLATION=3000
MAX_TEXT_LENGTH_CLEANUP=2000
MAX_TEXT_LENGTH_SUMMARY=3000
MAX_TEXT_LENGTH_BULLETS=2000
MAX_CHUNKS_PER_OPERATION=5
```

#### **Quality Mode**
```bash
# .env configuration for maximum quality (slower)
USE_LOCAL_NLP=true
MAX_TEXT_LENGTH_TRANSLATION=5000
MAX_TEXT_LENGTH_CLEANUP=4000
MAX_TEXT_LENGTH_SUMMARY=5000
MAX_TEXT_LENGTH_BULLETS=3000
MAX_CHUNKS_PER_OPERATION=10
```

## 🔧 Model-Specific Optimizations

### Translation (NLLB-200)
```python
# Performance settings in gemini_client.py
translator = pipeline(
    "translation", 
    model="facebook/nllb-200-distilled-600M",
    device=0,  # GPU device
    model_kwargs={
        "torch_dtype": "auto",
        "low_cpu_mem_usage": True,
        "use_cache": True
    }
)

# Translation parameters
result = translator(
    text,
    src_lang="eng_Latn",
    tgt_lang=target_lang,
    max_length=256,  # Reduced for speed
    num_beams=2,     # Reduced from 4
    early_stopping=True,
    do_sample=False  # Deterministic, faster
)
```

### Summarization (DistilBART)
```python
# Optimized summarizer
summarizer = pipeline(
    "summarization", 
    model="sshleifer/distilbart-cnn-12-6",
    device=0,
    model_kwargs={
        "torch_dtype": "float16",  # Half precision for speed
        "low_cpu_mem_usage": True
    }
)

# Summarization parameters
result = summarizer(
    text, 
    max_length=100,  # Shorter summaries
    min_length=20, 
    do_sample=False,
    length_penalty=1.0
)
```

### Text Generation (DistilGPT2)
```python
# Optimized text generator
text_generator = pipeline(
    "text-generation", 
    model="distilgpt2",
    device=0,
    model_kwargs={
        "torch_dtype": "float16",
        "pad_token_id": 50256  # Explicit padding
    }
)

# Generation parameters
result = text_generator(
    prompt, 
    max_length=150,
    num_return_sequences=1,
    do_sample=False,
    temperature=0.1,
    pad_token_id=50256
)
```

## 🚀 Advanced Optimizations

### 1. **Model Caching**
Models are automatically cached in `./models/` directory. First run downloads ~3GB of models.

### 2. **Memory Management**
```python
# Add to backend startup
import torch
if torch.cuda.is_available():
    torch.cuda.empty_cache()  # Clear GPU memory
    torch.backends.cudnn.benchmark = True  # Optimize for consistent input sizes
```

### 3. **Batch Processing**
For multiple documents, process them in batches:
```python
# Process multiple texts together
texts = [text1, text2, text3]
results = translator(texts, batch_size=3)
```

### 4. **Text Preprocessing**
```python
def optimize_text(text: str) -> str:
    """Optimize text before processing"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Remove very short lines (likely OCR artifacts)
    lines = [line for line in text.split('\n') if len(line.strip()) > 3]
    
    return '\n'.join(lines)
```

## 🔍 Performance Monitoring

### Backend Logging
Add performance monitoring to your backend:
```python
import time
import logging

def monitor_performance(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        logging.info(f"{func.__name__} took {end_time - start_time:.2f} seconds")
        return result
    return wrapper

@monitor_performance
def translate_text(self, text: str, target_language: str) -> str:
    # Your translation code here
    pass
```

### Memory Usage Tracking
```python
import psutil
import torch

def log_system_stats():
    # RAM usage
    memory = psutil.virtual_memory()
    print(f"RAM: {memory.percent}% used ({memory.used / 1024**3:.1f}GB / {memory.total / 1024**3:.1f}GB)")
    
    # GPU memory (if available)
    if torch.cuda.is_available():
        gpu_memory = torch.cuda.memory_allocated() / 1024**3
        gpu_total = torch.cuda.max_memory_allocated() / 1024**3
        print(f"GPU: {gpu_memory:.1f}GB / {gpu_total:.1f}GB")
```

## 🐛 Troubleshooting Performance Issues

### Common Issues & Solutions

#### **1. Slow First Run**
- **Cause**: Models downloading and loading
- **Solution**: Wait for initial model download (~3GB)
- **Prevention**: Pre-download models during setup

#### **2. High Memory Usage**
- **Symptoms**: System freezing, out of memory errors
- **Solutions**:
  - Reduce `MAX_TEXT_LENGTH_*` values in `.env`
  - Use CPU-only mode: `device=-1`
  - Close other applications
  - Upgrade RAM

#### **3. CUDA Out of Memory**
- **Symptoms**: "CUDA out of memory" errors
- **Solutions**:
  ```python
  # Reduce batch size
  MAX_CHUNKS_PER_OPERATION=2
  
  # Use mixed precision
  model_kwargs={"torch_dtype": "float16"}
  
  # Clear GPU cache
  torch.cuda.empty_cache()
  ```

#### **4. Slow Translation**
- **Symptoms**: Translation taking 5+ minutes
- **Solutions**:
  - Enable GPU acceleration
  - Reduce text length limits
  - Use fewer beams: `num_beams=2`
  - Switch to Gemini API for critical tasks

#### **5. Model Loading Errors**
- **Symptoms**: Import errors, model not found
- **Solutions**:
  ```bash
  # Reinstall transformers
  pip install --upgrade transformers torch
  
  # Clear model cache
  rm -rf ~/.cache/huggingface/
  
  # Manual model download
  python -c "from transformers import pipeline; pipeline('translation', model='facebook/nllb-200-distilled-600M')"
  ```

## 📈 Performance Testing

### Benchmark Script
Create `benchmark.py` to test your system:
```python
#!/usr/bin/env python3
import time
from backend.utils.gemini_client import GeminiClient

def benchmark_system():
    client = GeminiClient()
    
    test_text = "This is a test document for performance benchmarking. " * 50
    
    operations = [
        ("Translation", lambda: client.translate_text(test_text, "Spanish")),
        ("Cleanup", lambda: client.cleanup_text(test_text)),
        ("Summary", lambda: client.summarize_text(test_text)),
        ("Bullets", lambda: client.generate_bullet_points(test_text))
    ]
    
    results = {}
    for name, operation in operations:
        print(f"Testing {name}...")
        start_time = time.time()
        try:
            result = operation()
            end_time = time.time()
            duration = end_time - start_time
            results[name] = duration
            print(f"✅ {name}: {duration:.2f}s")
        except Exception as e:
            print(f"❌ {name}: Failed - {e}")
            results[name] = None
    
    print("\n📊 Benchmark Results:")
    for name, duration in results.items():
        if duration:
            print(f"  {name}: {duration:.2f}s")
        else:
            print(f"  {name}: Failed")

if __name__ == "__main__":
    benchmark_system()
```

### Expected Benchmarks

#### **GPU System (RTX 3070+)**
- Translation: 15-25 seconds
- Cleanup: 10-15 seconds  
- Summary: 8-12 seconds
- Bullets: 8-12 seconds

#### **CPU System (8+ cores)**
- Translation: 60-120 seconds
- Cleanup: 30-45 seconds
- Summary: 25-35 seconds
- Bullets: 25-35 seconds

#### **Gemini API**
- All operations: 3-10 seconds (network dependent)

## 🎯 Optimization Checklist

### Initial Setup
- [ ] Install CUDA-compatible PyTorch
- [ ] Configure `.env` for your use case
- [ ] Test GPU detection: `torch.cuda.is_available()`
- [ ] Run benchmark script
- [ ] Monitor memory usage during first run

### Ongoing Optimization
- [ ] Monitor processing times in logs
- [ ] Adjust text length limits based on needs
- [ ] Clear GPU cache if memory issues occur
- [ ] Update models periodically
- [ ] Consider Gemini API for critical workflows

### System Maintenance
- [ ] Keep 20GB+ free disk space
- [ ] Update GPU drivers regularly
- [ ] Monitor system temperature under load
- [ ] Backup model cache before major updates
- [ ] Test performance after system changes

## 💡 Pro Tips

1. **Hybrid Approach**: Use local models for development and Gemini API for production
2. **Preprocessing**: Clean and optimize text before AI processing
3. **Caching**: Cache frequently translated content
4. **Monitoring**: Log performance metrics to identify bottlenecks
5. **Scaling**: Consider cloud deployment for high-volume usage

## 📞 Performance Support

If you're experiencing performance issues:

1. Run `python check-system.py` for diagnostics
2. Check the benchmark results against expected values
3. Review system requirements and hardware compatibility
4. Consider upgrading to Gemini API for consistent performance
5. Join our community for optimization tips and support

---

**Remember**: Performance optimization is an iterative process. Start with the quick wins, monitor your results, and gradually implement advanced optimizations based on your specific needs and hardware capabilities. 