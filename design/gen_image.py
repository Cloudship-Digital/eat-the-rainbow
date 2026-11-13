"""Generate one image with the OpenAI Images API and save it as PNG.
Usage: python3 design/gen_image.py <out.png> <size> <prompt-file> [model]
The agent proxy adds the API key, so OPENAI_API_KEY can be any placeholder."""
import base64, json, os, sys, urllib.request

out, size, prompt_file = sys.argv[1:4]
model = sys.argv[4] if len(sys.argv) > 4 else "gpt-image-1.5"
body = {"model": model, "prompt": open(prompt_file).read(), "size": size,
        "n": 1, "background": os.environ.get("BG","transparent"), "output_format": "png", "quality": "high", "stream": True, "partial_images": 1}
req = urllib.request.Request("https://api.openai.com/v1/images/generations",
    data=json.dumps(body).encode(), method="POST",
    headers={"Content-Type": "application/json",
             "Authorization": "Bearer " + os.environ.get("OPENAI_API_KEY", "placeholder")})
try:
    with urllib.request.urlopen(req, timeout=600) as r:
        final = None
        for line in r:  # server-sent events keep the connection alive while it draws
            line = line.decode().strip()
            if line.startswith("data:") and line[5:].strip() not in ("", "[DONE]"):
                ev = json.loads(line[5:])
                if ev.get("type", "").endswith("completed"):
                    final = ev
        data = {"data": [{"b64_json": final["b64_json"]}]}
except urllib.error.HTTPError as e:
    sys.exit(f"HTTP {e.code}: {e.read().decode()[:800]}")
open(out, "wb").write(base64.b64decode(data["data"][0]["b64_json"]))
print("saved", out)
