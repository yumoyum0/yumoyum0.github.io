---
title: RAG Demo: Complete Setup, Run, and Cleanup Guide (WSL + Conda + VSCode)
date: 2026-5-18 16:00:00
tags:
- AI
categories:
- AI
---

# RAG Demo: Complete Setup, Run, and Cleanup Guide (WSL + Conda + VSCode)

## 1. Project Background

This demo is based on the classic paper:

- Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
- Authors: Patrick Lewis et al. (Meta / Facebook AI)

Paper:

https://arxiv.org/abs/2005.11401

HuggingFace Model:

https://huggingface.co/facebook/rag-token-nq

The paper introduced the classic RAG (Retrieval-Augmented Generation) architecture:

```text
Question
   ↓
Retriever (retrieve relevant documents)
   ↓
Generator (generate answers using retrieved context)
```

Many modern systems are based on these ideas:

- Enterprise Knowledge Bases
- AI Search
- AI Agents
- LangChain
- LlamaIndex

---

# 2. Recommended Development Environment

Recommended:

- Windows 11
- WSL2 Ubuntu
- VSCode + Remote WSL
- Miniconda
- Python 3.11

Not recommended:

- Installing AI packages directly into system Python
- Doing AI development with native Windows Python
- Developing AI projects under /mnt/c

---

# 3. Install WSL Ubuntu

Run in Administrator PowerShell:

```powershell
wsl --install
```

If Microsoft Store download fails:

```powershell
wsl --install Ubuntu --web-download
```

or:

```powershell
wsl --install -d Ubuntu --web-download
```

When Ubuntu launches for the first time:

```text
Create a default Unix user account
```

Set:

- Username
- Password

---

# 4. Install Basic Development Tools

Inside Ubuntu:

```bash
sudo apt update
sudo apt upgrade -y
```

Install development tools:

```bash
sudo apt install -y \
build-essential \
git \
curl \
wget \
vim
```

---

# 5. Install Miniconda (Recommended)

Download:

```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
```

Install:

```bash
bash Miniconda3-latest-Linux-x86_64.sh
```

Type:

```text
yes
```

Initialize conda:

```bash
~/miniconda3/bin/conda init
```

Reload shell:

```bash
source ~/.bashrc
```

Check conda:

```bash
conda --version
```

---

# 6. Create a Python 3.11 Environment

Create environment:

```bash
conda create -n rag python=3.11
```

Activate:

```bash
conda activate rag
```

Check Python version:

```bash
python --version
```

Expected output:

```text
Python 3.11.x
```

---

# 7. Create the Project Directory

Recommended:

```bash
mkdir -p ~/ai-projects/rag-demo
cd ~/ai-projects/rag-demo
```

Avoid:

```text
/mnt/c/...
```

Reasons:

- Slower performance
- More permission issues
- More WSL I/O problems
- pip failures happen more often

---

# 8. Install VSCode and WSL Extensions

VSCode:

https://code.visualstudio.com/

Remote WSL Extension:

https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl

Python Extension:

https://marketplace.visualstudio.com/items?itemName=ms-python.python

Inside the project directory:

```bash
code .
```

The bottom-left corner in VSCode should display:

```text
WSL: Ubuntu
```

---

# 9. Install RAG Demo Dependencies

⚠️ Important:

This RAG implementation is from 2020.

Some dependency versions must be pinned.

Otherwise:

- NumPy 2.x
- datasets 4.x
- latest transformers

may introduce compatibility issues.

Install recommended versions:

```bash
pip install \
numpy==1.26.4 \
datasets==2.19.2 \
transformers==4.41.2 \
faiss-cpu \
sentencepiece \
torch
```

---

# 10. Create the RAG Demo

Create the file:

```bash
touch rag_demo.py
```

Code:

```python
from transformers import RagTokenizer
from transformers import RagRetriever
from transformers import RagTokenForGeneration

# tokenizer

tokenizer = RagTokenizer.from_pretrained(
    "facebook/rag-token-nq"
)

# retriever

retriever = RagRetriever.from_pretrained(
    "facebook/rag-token-nq",
    index_name="exact",
    use_dummy_dataset=True
)

# model

model = RagTokenForGeneration.from_pretrained(
    "facebook/rag-token-nq",
    retriever=retriever
)

question = "Who invented the telephone?"

inputs = tokenizer(question, return_tensors="pt")

generated = model.generate(
    input_ids=inputs["input_ids"]
)

answer = tokenizer.batch_decode(
    generated,
    skip_special_tokens=True
)[0]

print("Q:", question)
print("A:", answer)
```

---

# 11. Run the Demo

Run:

```bash
python rag_demo.py
```

The first run downloads:

- DPR
- BART
- tokenizers
- FAISS index
- wiki_dpr

The total size may reach several GB.

The first run can be slow. This is normal.

Expected output:

```text
Q: Who invented the telephone?
A: Alexander Graham Bell
```

---

# 12. Common Issues

## 12.1 datasets scripts are no longer supported

Cause:

New versions of datasets removed old dataset script support.

Solution:

```bash
pip install datasets==2.19.2
```

---

## 12.2 NumPy 2.x errors

Example:

```text
ValueError: Unable to avoid copy while creating an array
```

Cause:

Old RAG code is incompatible with NumPy 2.x.

Solution:

```bash
pip install numpy==1.26.4
```

---

## 12.3 WSL Input/output error

Common causes:

- C drive full
- pip cache too large
- HuggingFace cache too large
- WSL ext4.vhdx out of space

Solutions:

- Keep 30–50GB free on C drive
- Clean caches
- Avoid development under /mnt/c

---

## 12.4 conda command not found

Run:

```bash
~/miniconda3/bin/conda init
source ~/.bashrc
```

---

# 13. Check the Current Environment

List conda environments:

```bash
conda env list
```

Check current Python:

```bash
which python
```

Check Python version:

```bash
python --version
```

---

# 14. Remove the Environment

Deactivate:

```bash
conda deactivate
```

Delete the environment:

```bash
conda remove -n rag --all
```

---

# 15. Clean Cache (Recommended)

Remove HuggingFace cache:

```bash
rm -rf ~/.cache/huggingface
```

Remove pip cache:

```bash
rm -rf ~/.cache/pip
```

---

# 16. Save the Environment

Save dependencies:

```bash
pip freeze > requirements.txt
```

Restore dependencies:

```bash
pip install -r requirements.txt
```

---

# 17. Modern RAG Architecture

This demo is mainly:

```text
A 2020 academic prototype
```

Modern industrial RAG systems usually follow:

```text
Documents
   ↓
Embedding Model
   ↓
Vector Database
   ↓
Retriever
   ↓
LLM
```

Recommended technologies to learn next:

## LangChain

https://www.langchain.com/

## LlamaIndex

https://www.llamaindex.ai/

## Qdrant

https://qdrant.tech/

## Chroma

https://www.trychroma.com/

## FastAPI

https://fastapi.tiangolo.com/

---

# 18. Recommended Next Projects

Suggested practice projects:

- PDF Question Answering
- Local Knowledge Base
- AI Search
- Enterprise FAQ Agent
- AI Workflow Automation
- Email Agent
- MCP Tools

These are common directions for:

- AI Application Engineers
- AI Agent Engineers
- AI Automation
- Freelancing

---

# 19. Important AI Engineering Lessons

## 1. Never install AI packages into system Python

Avoid:

```bash
sudo pip install ...
```

---

## 2. Use conda to manage environments

Recommended:

```bash
conda create -n xxx python=3.11
```

---

## 3. Pin dependency versions

The AI ecosystem changes extremely fast.

Especially:

- transformers
- torch
- datasets
- numpy
- langchain

breaking changes happen frequently.

---

## 4. Keep large free disk space on C drive

Recommended:

```text
50GB+
```

---

## 5. Regularly back up WSL

Example:

```powershell
wsl --export Ubuntu ubuntu-backup.tar
```

---

# 20. Final Summary

By completing this demo, you have practiced:

- WSL Linux development
- Conda environment management
- VSCode + Remote WSL
- Transformers basics
- RAG basics
- HuggingFace basics
- FAISS basics
- AI dependency management

This is an important starting point for modern AI Application and Agent development.

