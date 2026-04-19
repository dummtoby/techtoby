import json
import os
import urllib.request
import urllib.error
import tempfile
import subprocess

# Import your submodules logically
from public import utils
from private import secret_processor

_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEVMODE_FILE = os.path.join(_PROJECT_ROOT, 'devmode.json')

def get_devmode():
    try:
        if os.path.exists(DEVMODE_FILE):
            with open(DEVMODE_FILE, 'r') as f:
                return json.load(f)
    except Exception:
        pass
    return {"enabled": False, "url": ""}

def set_devmode(enabled, url):
    with open(DEVMODE_FILE, 'w') as f:
        json.dump({"enabled": bool(enabled), "url": str(url)}, f)

def check_for_update():
    current_version = "0.0"
    config_path = os.path.join(_PROJECT_ROOT, 'properties.config')
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line.startswith("VERSION="):
                    current_version = line.split("=", 1)[1].strip()
                    break
    try:
        req = urllib.request.Request(
            "https://api.github.com/repos/dummtoby/techtoby/releases/latest",
            headers={'User-Agent': 'TechtobyOS/1.0'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))

        latest_version = data.get("tag_name", "").lstrip("v")
        installer_url = ""
        for asset in data.get("assets", []):
            if asset["name"].lower().endswith(".exe"):
                installer_url = asset["browser_download_url"]
                break

        return {
            "update_available": latest_version != current_version and latest_version != "",
            "current_version": current_version,
            "latest_version": latest_version,
            "release_name": data.get("name", latest_version),
            "installer_url": installer_url
        }
    except Exception as e:
        return {"update_available": False, "error": str(e)}

def download_and_install_update(installer_url):
    if not installer_url or not installer_url.startswith("https://github.com/"):
        return {"error": "Invalid installer URL"}

    temp_dir = tempfile.gettempdir()
    installer_path = os.path.join(temp_dir, "TechtobyOS_Update.exe")

    req = urllib.request.Request(installer_url, headers={'User-Agent': 'TechtobyOS/1.0'})
    with urllib.request.urlopen(req) as response:
        with open(installer_path, 'wb') as f:
            while True:
                chunk = response.read(8192)
                if not chunk:
                    break
                f.write(chunk)

    subprocess.Popen([installer_path])
    return {"path": installer_path}

def handle_message(message_str):
    try:
        req = json.loads(message_str)
        action = req.get("action")
        
        # 1. Base Framework Example
        if action == "ping":
            data = req.get("data", "")
            return json.dumps({"status": "ok", "result": f"Pong! I received: {data}"})
            
        # 2. Public Module Example (e.g., formatting, generic API calls)
        elif action == "public_demo":
            user_name = req.get("name", "")
            greeting = utils.generate_greeting(user_name)
            return json.dumps({"status": "ok", "result": greeting})
            
        # 3. Private Module Example (e.g., database writes, OS file modifications)
        elif action == "private_demo":
            secret_data = req.get("secret_data", "")
            secure_hash_msg = secret_processor.process_secure_data(secret_data)
            return json.dumps({"status": "ok", "result": secure_hash_msg})

        # 4. Developer Mode
        elif action == "get_devmode":
            result = get_devmode()
            return json.dumps({"status": "ok", "result": result})

        elif action == "set_devmode":
            set_devmode(req.get("enabled", False), req.get("url", ""))
            return json.dumps({"status": "ok"})

        # 5. App Update
        elif action == "check_update":
            result = check_for_update()
            return json.dumps({"status": "ok", "result": result})

        elif action == "download_and_install_update":
            result = download_and_install_update(req.get("installer_url", ""))
            if "error" in result:
                return json.dumps({"status": "error", "reason": result["error"]})
            return json.dumps({"status": "ok", "result": result})
            
        return json.dumps({"status": "error", "reason": "Unknown action"})
    except Exception as e:
        return json.dumps({"status": "error", "reason": str(e)})
