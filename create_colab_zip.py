import zipfile
import os
import json

# Create a new ZIP file with proper encoding
zip_path = 'poutrysense_colab_package.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    # Add colab_package folder contents
    colab_package_path = 'colab_package'
    for root, dirs, files in os.walk(colab_package_path):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, 'colab_package')
            arcname = os.path.join('poutrysense_colab_package', arcname)
            
            # Read and validate JSON files
            if file.endswith('.json'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    try:
                        json.load(f)  # Validate JSON
                    except json.JSONDecodeError as e:
                        print(f"Invalid JSON in {file_path}: {e}")
                        continue
            
            zipf.write(file_path, arcname)
            print(f"Added: {arcname} ({os.path.getsize(file_path)} bytes)")

# Verify the ZIP file
print("\n--- ZIP Contents Verification ---")
with zipfile.ZipFile(zip_path, 'r') as zipf:
    for info in zipf.filelist:
        print(f"{info.filename}: {info.file_size} bytes")

print(f"\nZIP file created: {zip_path}")
print(f"Total size: {os.path.getsize(zip_path)} bytes")
