import os
import json

keys_to_remove = ["donation", "donation_title", "donation_desc", "scan_qr", "account_address", "donate_with"]
dir_path = r"d:\NextJS\auratv-online\dictionaries"

for filename in os.listdir(dir_path):
    if filename.endswith(".json"):
        filepath = os.path.join(dir_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if "common" in data:
            for key in keys_to_remove:
                if key in data["common"]:
                    del data["common"][key]
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Updated {filename}")
