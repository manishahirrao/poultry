"""
PoultryPulse AI — Watermark Decoder
File: apps/api/watermark/decoder.py
Reference: TRD v1.0 §6.1
Extracts and parses ZWC watermarks from text strings for IP violation checks.
"""

import sys
import json
from zwc_encoder import extract_zwc_payload, decode_zwc_to_binary, verify_and_parse_payload

def decode_text(text: str):
    """Decode watermarked text and print the embedded payload."""
    zwc_str = extract_zwc_payload(text)
    
    if not zwc_str:
        return {"found": False, "error": "No ZWC payload found"}
        
    binary_str = decode_zwc_to_binary(zwc_str)
    result = verify_and_parse_payload(binary_str)
    
    if result.get("valid"):
        return {"found": True, "payload": result}
    else:
        return {"found": True, "valid": False, "error": result.get("error")}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = sys.argv[1]
        print(json.dumps(decode_text(text), indent=2))
    else:
        print("Usage: python decoder.py '<text_to_analyze>'")
