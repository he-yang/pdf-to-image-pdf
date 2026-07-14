# PDF-to-Image-PDF

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/he-yang/pdf-to-image-pdf/releases)
[![Version](https://img.shields.io/github/v/release/he-yang/pdf-to-image-pdf)](https://github.com/he-yang/pdf-to-image-pdf/releases)

A powerful open-source PDF processing tool that runs entirely locally. No files are uploaded to the internet, protecting your privacy and security.

[中文 README](README_zh.md)

---

## 📖 Table of Contents

- [Features](#features)
- [Download & Install](#download--install)
- [Usage](#usage)
- [Development](#development)
- [Build & Package](#build--package)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 📄 PDF Conversion
- Convert PDF files to images (PNG format)
- Convert PDF files to image-based PDF (each page as an image)
- Support batch processing of multiple PDF files
- Add custom watermarks (text, position, size, opacity)
- Support multiple DPI settings (72/150/300/600)

### 📑 Page Extraction
- Extract specific page ranges from PDF files
- Support multiple input formats:
  - Single page: `5`
  - Continuous range: `1-5`
  - Multiple ranges: `1-5, 8, 10-15`
- Preserve original file format and quality

### 📚 PDF Merging
- Merge multiple PDF files into one
- Support adjusting merge order
- Preserve bookmarks and metadata

### 🔒 Privacy Protection
- All processing done locally, no file uploads
- No user data collection

---

## 📥 Download & Install

### Latest Version

Download the latest version from [GitHub Releases](https://github.com/he-yang/pdf-to-image-pdf/releases).

### Supported Platforms

- **Windows**: `.exe` installer (x64)
- **macOS**: `.dmg` installer (Intel and Apple Silicon)
- **Linux**: `.appImage` portable file, `tar.gz` archive

---

## 📝 Usage

### PDF Conversion
1. Click the "Select Files" button to choose one or more PDF files
2. Select output format (image-based PDF or images only)
3. Optional: Enable watermark and set watermark parameters
4. Select DPI quality
5. Click the "Start Conversion" button

### Page Extraction
1. Switch to the "Extract Pages" tab
2. Click the "Select PDF File" button to choose a PDF file
3. Enter page range in the input box (e.g., `1-5, 8`)
4. Click the "Extract Pages" button

### PDF Merging
1. Switch to the "Merge PDF" tab
2. Click the "Add PDF Files" button to choose multiple PDF files
3. Adjust file order if needed
4. Click the "Merge PDF" button

---


## 📄 License

This project is released under the [MIT License](LICENSE).

---


Made with ❤️ by the PDF-to-Image-PDF Team
