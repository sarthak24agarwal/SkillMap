# Note: If you get a 'ModuleNotFoundError: No module named "fitz"', 
# you should run: pip install pymupdf
# Do NOT run 'pip install fitz' because fitz is an older, unrelated package on PyPI.
# PyMuPDF installs itself under the module name 'fitz' for legacy reasons.
import fitz

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts all text from the bytes of a PDF file.
    
    Why are we taking file_bytes instead of a file path?
    When a user uploads a file through our FastAPI endpoint (POST /upload-resume), 
    FastAPI receives the file as an in-memory stream of bytes. Passing the raw bytes 
    directly to the parser allows us to read the PDF in memory without writing it 
    to the server's hard drive first. This is faster and avoids cluttering our file system.
    """
    try:
        # fitz.open can accept stream=file_bytes to open a PDF directly from memory.
        # filetype="pdf" tells fitz that the byte stream represents a PDF.
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        
        extracted_text_pages = []
        
        for page_num in range(len(doc)):
            # Load the current page
            page = doc.load_page(page_num)
            # Extract plain text from this page
            page_text = page.get_text()
            # Append it to our list
            extracted_text_pages.append(page_text)
            
        # Join all pages with a newline character
        full_text = "\n".join(extracted_text_pages).strip()
        
        # Check if we got any text at all
        if not full_text:
            print("Warning: The PDF has no extractable text. It might be a scanned image or empty.")
            
        return full_text

    except Exception as e:
        # Friendly print statement for debugging
        print(f"Error parsing PDF: {e}")
        # Return an empty string if parsing fails entirely
        return ""

if __name__ == "__main__":
    import sys
    import os
    
    print("=== stand-alone PDF parser test ===")
    
    # We allow passing a PDF file path via command line argument to test:
    # Example: python pdf_parser.py resume.pdf
    if len(sys.argv) < 2:
        print("Usage: python pdf_parser.py <path_to_pdf_file>")
        print("Please provide a PDF file path to run a standalone test.")
        
        # Create a dummy run suggestion if they don't provide one
        print("\nTip: Try creating a sample PDF or place a resume in this folder, then run:")
        print("python pdf_parser.py resume.pdf")
    else:
        pdf_path = sys.argv[1]
        
        if not os.path.exists(pdf_path):
            print(f"Error: The file '{pdf_path}' does not exist. Please check the path.")
        else:
            print(f"Reading file: {pdf_path}")
            try:
                # Read the file as binary bytes
                with open(pdf_path, "rb") as f:
                    file_data = f.read()
                
                # Run our parser
                extracted = extract_text_from_pdf(file_data)
                
                print("\n--- Extraction Preview (First 200 characters) ---")
                if extracted:
                    print(extracted[:200])
                    print("\n-------------------------------------------------")
                    print(f"Total characters extracted: {len(extracted)}")
                else:
                    print("[No text extracted]")
                    
            except Exception as test_err:
                print(f"Failed to read or parse file: {test_err}")
