import os
import sys

print("Starting test...")
print(f"Current directory: {os.getcwd()}")

# Check if PDF exists
pdf_path = "../GateMaterials/Previous year questions/CSE.pdf"
print(f"Checking PDF path: {pdf_path}")
print(f"PDF exists: {os.path.exists(pdf_path)}")

if os.path.exists(pdf_path):
    print(f"PDF size: {os.path.getsize(pdf_path)} bytes")
    
    # Try to import and run analyzer
    try:
        print("\nImporting pdfplumber...")
        import pdfplumber
        print("✅ pdfplumber imported")
        
        print("\nTrying to open PDF...")
        with pdfplumber.open(pdf_path) as pdf:
            print(f"✅ PDF opened successfully")
            print(f"Number of pages: {len(pdf.pages)}")
            
            # Extract first page
            if len(pdf.pages) > 0:
                print("\nExtracting first page...")
                text = pdf.pages[0].extract_text()
                print(f"First page text length: {len(text) if text else 0}")
                if text:
                    print(f"First 200 characters:\n{text[:200]}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("❌ PDF file not found!")
    print("\nListing parent directory:")
    parent = ".."
    if os.path.exists(parent):
        for item in os.listdir(parent):
            print(f"  - {item}")

print("\nTest complete!")
