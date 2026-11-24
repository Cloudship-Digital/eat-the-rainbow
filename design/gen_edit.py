"""Make one image from reference pictures with the OpenAI Images edit endpoint (for drawing an existing
character, like Coco, in this app's style). The agent proxy adds the API key.
Usage: python3 design/gen_edit.py <out.png> <size> <prompt-file> <ref1.png> [ref2.png ...]"""
import base64, json, os, sys, uuid, urllib.request

out, size, prompt_file, *refs = sys.argv[1:]
boundary = uuid.uuid4().hex
parts = []
def field(name, value):
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
for k, v in {"model": "gpt-image-1.5", "prompt": open(prompt_file).read(), "size": size, "n": "1",
             "background": "transparent", "output_format": "png", "quality": "high",
             "input_fidelity": "high", "stream": "true", "partial_images": "1"}.items():
    field(k, v)
for r in refs:
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="{os.path.basename(r)}"\r\nContent-Type: image/png\r\n\r\n'.encode()
                 + open(r, "rb").read() + b"\r\n")
parts.append(f"--{boundary}--\r\n".encode())
req = urllib.request.Request("https://api.openai.com/v1/images/edits", data=b"".join(parts), method="POST",
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}",
             "Authorization": "Bearer " + os.environ.get("OPENAI_API_KEY", "placeholder")})
try:
    with urllib.request.urlopen(req, timeout=600) as r:
        final = None
        for line in r:
            line = line.decode().strip()
            if line.startswith("data:") and line[5:].strip() not in ("", "[DONE]"):
                ev = json.loads(line[5:])
                if ev.get("type", "").endswith("completed"):
                    final = ev
except urllib.error.HTTPError as e:
    sys.exit(f"HTTP {e.code}: {e.read().decode()[:800]}")
open(out, "wb").write(base64.b64decode(final["b64_json"]))
print("saved", out)
