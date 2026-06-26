"""
PoultryPulse AI — Zero-Width Character Watermarking System
File: apps/api/watermark/zwc_encoder.py
Reference: TRD v1.0 §6.1
Critical IP protection system. Encodes customer details invisibly into text.
"""

import hmac
import hashlib
import binascii
from typing import Dict, Any, Tuple

# Zero-width characters used for binary encoding
ZWC_0 = '\u200b'  # Zero Width Space
ZWC_1 = '\u200c'  # Zero Width Non-Joiner
ZWC_SEP = '\u200d'  # Zero Width Joiner
ZWC_START = '\ufeff'  # Zero Width No-Break Space

# 128-bit payload: customer_id (32) + timestamp (32) + device_fp (32) + HMAC (32)
# Since we are just encoding bits, we will serialize the data into a binary string.

def generate_hmac(payload_str: str, secret: str = "PULSE_SECRET_KEY") -> str:
    """Generate truncated HMAC for payload verification."""
    h = hmac.new(secret.encode(), payload_str.encode(), hashlib.sha256)
    # Take first 8 hex chars (32 bits)
    return h.hexdigest()[:8]

def encode_payload_to_binary(customer_id: str, timestamp_hour: int, device_fp: str) -> str:
    """Convert payload to a binary string."""
    # Ensure standard lengths (mock lengths for simplicity)
    cid = str(customer_id)[:8].ljust(8, '0')
    ts = str(timestamp_hour)[:8].ljust(8, '0')
    dfp = str(device_fp)[:8].ljust(8, '0')
    
    payload_str = f"{cid}{ts}{dfp}"
    sig = generate_hmac(payload_str)
    
    full_payload = f"{payload_str}{sig}"
    
    # Convert to binary
    binary = bin(int(binascii.hexlify(full_payload.encode()), 16))[2:]
    return binary

def binary_to_zwc(binary_str: str) -> str:
    """Convert binary string to ZWC sequence."""
    zwc_str = ZWC_START
    for bit in binary_str:
        if bit == '0':
            zwc_str += ZWC_0
        else:
            zwc_str += ZWC_1
    zwc_str += ZWC_SEP
    return zwc_str

def apply_text_watermark(text: str, customer_id: str, timestamp_hour: int, device_fp: str) -> str:
    """
    Apply ZWC watermark to text.
    Intersperse after every 5th visible character per TRD §6.1
    """
    binary_payload = encode_payload_to_binary(customer_id, timestamp_hour, device_fp)
    zwc_payload = binary_to_zwc(binary_payload)
    
    # Distribute the payload throughout the text
    # We'll split the zwc_payload into chunks and insert them
    
    chunk_size = max(1, len(zwc_payload) // (len(text) // 5 + 1))
    zwc_chunks = [zwc_payload[i:i+chunk_size] for i in range(0, len(zwc_payload), chunk_size)]
    
    watermarked_text = ""
    chunk_idx = 0
    
    for i, char in enumerate(text):
        watermarked_text += char
        if (i + 1) % 5 == 0 and chunk_idx < len(zwc_chunks):
            watermarked_text += zwc_chunks[chunk_idx]
            chunk_idx += 1
            
    # Append any remaining ZWC at the end
    if chunk_idx < len(zwc_chunks):
        watermarked_text += "".join(zwc_chunks[chunk_idx:])
        
    return watermarked_text

def extract_zwc_payload(watermarked_text: str) -> str:
    """Extract ZWC characters from text."""
    zwc_chars = [c for c in watermarked_text if c in (ZWC_0, ZWC_1, ZWC_SEP, ZWC_START)]
    return "".join(zwc_chars)

def decode_zwc_to_binary(zwc_str: str) -> str:
    """Convert ZWC string back to binary."""
    if not zwc_str or zwc_str[0] != ZWC_START:
        return ""
        
    binary = ""
    for char in zwc_str[1:]:
        if char == ZWC_SEP:
            break
        elif char == ZWC_0:
            binary += '0'
        elif char == ZWC_1:
            binary += '1'
            
    return binary

def verify_and_parse_payload(binary_str: str) -> Dict[str, Any]:
    """Parse binary back to payload and verify HMAC."""
    if not binary_str:
        return {"valid": False, "error": "No binary payload"}
        
    try:
        # Pad binary if needed to be divisible by 8
        binary_str = binary_str.zfill((len(binary_str) + 7) // 8 * 8)
        
        n = int(binary_str, 2)
        hex_str = '%x' % n
        if len(hex_str) % 2 != 0:
            hex_str = '0' + hex_str
            
        full_payload = binascii.unhexlify(hex_str).decode()
        
        # Extract components
        cid = full_payload[0:8]
        ts = full_payload[8:16]
        dfp = full_payload[16:24]
        sig = full_payload[24:32]
        
        payload_str = f"{cid}{ts}{dfp}"
        expected_sig = generate_hmac(payload_str)
        
        if sig != expected_sig:
            return {"valid": False, "error": "HMAC signature mismatch"}
            
        return {
            "valid": True,
            "customer_id": cid.strip('0'),
            "timestamp_hour": int(ts),
            "device_fp": dfp.strip('0')
        }
    except Exception as e:
        return {"valid": False, "error": str(e)}

if __name__ == "__main__":
    # Test
    text = "Broiler price likely to rise Rs3-5/kg by Thursday."
    watermarked = apply_text_watermark(text, "RY-2041", 493021, "a3f9")
    print(f"Original len: {len(text)}, Watermarked len: {len(watermarked)}")
    
    extracted_zwc = extract_zwc_payload(watermarked)
    bin_payload = decode_zwc_to_binary(extracted_zwc)
    result = verify_and_parse_payload(bin_payload)
    print(f"Verification: {result}")
