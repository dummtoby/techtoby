import os
import sys
import json
import subprocess
import urllib.request
import urllib.error
import shutil

GITHUB_REPO = "dummtoby/techtoby"
GITHUB_API = f"https://api.github.com/repos/{GITHUB_REPO}"

RELEASE_BODY_TEMPLATE = """### Techtoby OS

Tired of needing to have a heavy and laggy browser opened while you play Bloxburg and you wish to have your very own desktop companion, well that's why I have made a desktop app version of the Techtoby Corp website.

It runs the website in a sandboxed environment so you will still need an internet connection for it to work, but the good thing is that it wont require you to update the app every time an update comes out in order to get the latest features.

### Security & Troubleshooting

If you have issues downloading the app, make sure you donwload it on a web browser that allows you to keep potentially dangerous apps on your computer. The potentially dangerous message is there only for user knowledge, it doesn't mean that it's 100% a virus. And to get rid of it, I would need to pay a software license key, and since it's a personal project, I don't have the funds to pay microsoft a sum of 350$ or more in order to mark my software autorun on their Windows 11 operating system.

### Changes
{changes}"""


def print_header(title):
    print("\n" + "=" * 50)
    print(f"  {title}")
    print("=" * 50)


def parse_properties_config():
    props = {}
    config_path = "properties.config"
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and "=" in line and not line.startswith("#"):
                    key, val = line.split("=", 1)
                    props[key.strip()] = val.strip()
    return props


def find_gh_exe():
    """Find the gh executable, checking PATH and common install locations."""
    # Check if it's already on PATH
    gh = shutil.which("gh")
    if gh:
        return gh
    # Check common install locations
    for candidate in [
        os.path.join(os.environ.get("ProgramFiles", r"C:\Program Files"), "GitHub CLI", "gh.exe"),
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "GitHub CLI", "gh.exe"),
    ]:
        if os.path.exists(candidate):
            return candidate
    return None


def ensure_gh_installed():
    """Check if GitHub CLI is installed, offer to install via winget if not."""
    if find_gh_exe():
        return True

    print("[!] GitHub CLI (gh) is not installed.")
    choice = input("Would you like to install it automatically via winget? (y/n): ").strip().lower()
    if choice != "y":
        print("  You can install it manually from: https://cli.github.com/")
        return False

    print(" -> Installing GitHub CLI...")
    try:
        subprocess.run(
            ["winget", "install", "--id", "GitHub.cli", "--silent",
             "--accept-package-agreements", "--accept-source-agreements"],
            check=True
        )
        if find_gh_exe():
            print("[Success] GitHub CLI installed!")
            return True
        else:
            print("[Error] GitHub CLI was installed but could not be found. Restart your terminal and try again.")
            return False
    except FileNotFoundError:
        print("[Error] 'winget' is not available on this system.")
        print("  Install GitHub CLI manually from: https://cli.github.com/")
        return False
    except subprocess.CalledProcessError as e:
        print(f"[Error] Failed to install GitHub CLI: {e}")
        return False


def get_github_token():
    # Try gh CLI first
    gh = find_gh_exe()
    if gh:
        try:
            result = subprocess.run(
                [gh, "auth", "token"],
                capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip()
        except subprocess.TimeoutExpired:
            pass

    # Fall back to environment variable
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        return token

    # No auth found — try to login interactively via gh CLI
    print("\n[!] No GitHub authentication found. Logging in via GitHub CLI...")
    if not ensure_gh_installed():
        sys.exit(1)
    gh = find_gh_exe()
    try:
        subprocess.run([gh, "auth", "login"], check=True)
        result = subprocess.run(
            [gh, "auth", "token"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        pass

    print("[Error] GitHub authentication failed.")
    sys.exit(1)


def github_request(endpoint, method="GET", data=None, token=None, content_type="application/json"):
    url = endpoint if endpoint.startswith("https://") else f"{GITHUB_API}/{endpoint}"
    body = None
    if data is not None:
        if content_type == "application/json":
            body = json.dumps(data).encode("utf-8")
        else:
            body = data

    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("User-Agent", "TechtobyOS-Release/1.0")
    req.add_header("Accept", "application/vnd.github+json")
    if token:
        req.add_header("Authorization", f"token {token}")
    if body is not None:
        req.add_header("Content-Type", content_type)

    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        print(f"[Error] GitHub API returned HTTP {e.code}: {error_body}")
        return None


def upload_asset(upload_url, file_path, token):
    # upload_url comes with {?name,label} template — strip that
    upload_url = upload_url.split("{")[0]
    filename = os.path.basename(file_path)
    upload_url += f"?name={filename}"

    with open(file_path, "rb") as f:
        file_data = f.read()

    req = urllib.request.Request(upload_url, data=file_data, method="POST")
    req.add_header("User-Agent", "TechtobyOS-Release/1.0")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Authorization", f"token {token}")
    req.add_header("Content-Type", "application/octet-stream")
    req.add_header("Content-Length", str(len(file_data)))

    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        print(f"[Error] Failed to upload asset: HTTP {e.code}: {error_body}")
        return None


def delete_asset(asset_id, token):
    url = f"{GITHUB_API}/releases/assets/{asset_id}"
    req = urllib.request.Request(url, method="DELETE")
    req.add_header("User-Agent", "TechtobyOS-Release/1.0")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Authorization", f"token {token}")
    try:
        with urllib.request.urlopen(req):
            return True
    except urllib.error.HTTPError as e:
        print(f"[Error] Failed to delete old asset: HTTP {e.code}")
        return False


def get_commit_message_for_tag(tag):
    try:
        result = subprocess.run(
            ["git", "log", "--format=%B", "-n", "1", tag],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    return None


def build_installer():
    print_header("Building Installer")
    # Import and call build_installer from build.py
    # We need to run it as a subprocess so it uses the correct cwd
    result = subprocess.run(
        [sys.executable, "-c",
         "import sys; sys.path.insert(0, 'scripts'); from build import build_installer; build_installer()"],
        cwd=os.getcwd()
    )
    if result.returncode != 0:
        print("[Error] Installer build failed.")
        return None

    props = parse_properties_config()
    app_title = props.get("TITLE", "ESDEngine")
    safe_name = "".join(c for c in app_title if c.isalnum())
    installer_path = os.path.join("dist", f"{safe_name}_Installer.exe")

    if not os.path.exists(installer_path):
        print(f"[Error] Expected installer not found at: {installer_path}")
        return None

    # Rename to Installer.exe
    final_path = os.path.join("dist", "Installer.exe")
    if os.path.exists(final_path):
        os.remove(final_path)
    shutil.copy(installer_path, final_path)
    print(f"\n[Success] Installer copied to: {os.path.abspath(final_path)}")
    return final_path


def build_release_body(tag):
    commit_msg = get_commit_message_for_tag(tag)
    if commit_msg:
        lines = commit_msg.strip().split("\n")
        changes = "\n".join(f"- {line}" for line in lines if line.strip())
    else:
        changes = "- No commit message found for this tag."
    return RELEASE_BODY_TEMPLATE.format(changes=changes)


def create_new_release(token):
    props = parse_properties_config()
    version = props.get("VERSION", "1.0")
    tag = version

    print(f"\n -> Version from properties.config: {version}")
    print(f" -> Tag: {tag}")

    # Build the installer
    installer_path = build_installer()
    if not installer_path:
        return

    # Build release body
    body = build_release_body(tag)

    print(f"\n -> Creating GitHub release '{tag}'...")
    release = github_request("releases", method="POST", data={
        "tag_name": tag,
        "name": f"Techtoby OS v{version}",
        "body": body,
        "draft": False,
        "prerelease": False
    }, token=token)

    if not release:
        return

    print(f" -> Release created: {release.get('html_url')}")

    # Upload the installer
    print(" -> Uploading Installer.exe...")
    asset = upload_asset(release["upload_url"], installer_path, token)
    if asset:
        print(f"\n[Success] Release v{version} published with Installer.exe!")
        print(f"          {release.get('html_url')}")
    else:
        print("[Error] Release created but asset upload failed.")


def update_existing_release(token):
    # Fetch all releases
    print("\n -> Fetching existing releases...")
    releases = github_request("releases", token=token)
    if not releases or len(releases) == 0:
        print("[Error] No existing releases found.")
        return

    print("\n Available releases:")
    for i, rel in enumerate(releases):
        tag = rel.get("tag_name", "?")
        name = rel.get("name", "Untitled")
        assets_count = len(rel.get("assets", []))
        print(f"  {i + 1}. {name} (tag: {tag}) — {assets_count} asset(s)")

    choice = input(f"\nSelect release to update (1-{len(releases)}): ").strip()
    try:
        idx = int(choice) - 1
        if idx < 0 or idx >= len(releases):
            raise ValueError
    except ValueError:
        print("[Error] Invalid selection.")
        return

    release = releases[idx]
    release_id = release["id"]
    tag = release["tag_name"]
    print(f"\n -> Selected: {release.get('name')} (tag: {tag})")

    # Build the installer
    installer_path = build_installer()
    if not installer_path:
        return

    # Delete old Installer.exe asset if it exists
    for asset in release.get("assets", []):
        if asset["name"] == "Installer.exe":
            print(f" -> Removing old Installer.exe (asset #{asset['id']})...")
            delete_asset(asset["id"], token)

    # Update the release body
    body = build_release_body(tag)
    print(" -> Updating release body...")
    github_request(f"releases/{release_id}", method="PATCH", data={
        "body": body
    }, token=token)

    # Upload new asset
    print(" -> Uploading new Installer.exe...")
    asset = upload_asset(release["upload_url"], installer_path, token)
    if asset:
        print(f"\n[Success] Release '{release.get('name')}' updated with new Installer.exe!")
        print(f"          {release.get('html_url')}")
    else:
        print("[Error] Failed to upload the new Installer.exe.")


def main():
    print_header("Techtoby OS — GitHub Release Manager")
    print(" 1. Create a new release")
    print(" 2. Update an existing release")
    print(" 3. Exit")

    choice = input("\nSelect an option (1/2/3): ").strip()

    if choice == "3":
        return

    token = get_github_token()

    if choice == "1":
        create_new_release(token)
    elif choice == "2":
        update_existing_release(token)
    else:
        print("Invalid selection.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nCancelled.")
        sys.exit(0)
