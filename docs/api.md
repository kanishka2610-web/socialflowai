# SocialFlow AI - Webhook API Specification

SocialFlow AI communicates with the n8n automation engine via JSON payloads sent over standard HTTP POST requests.

## Endpoint Details

- **Method**: `POST`
- **Default Production URL**: `https://saikanishka.app.n8n.cloud/webhook-test/a938f841-0d71-4c98-aa06-31d533a11c73`
- **Content-Type**: `application/json`

---

## Request Schema

```json
{
  "title": "Post Title Here",
  "caption": "Post description with #hashtags!",
  "mediaFiles": [
    {
      "name": "ai-poster-square.png",
      "size": 450000,
      "type": "image/png",
      "preview": "data:image/png;base64,iVBORw0KG..."
    }
  ],
  "selectedPlatforms": ["instagram", "x"],
  "scheduleTime": "2026-07-20T18:30:00+05:30",
  "user": {
    "name": "Alex Morgan",
    "email": "alex@acme.corp",
    "avatar_url": null
  }
}
```

### Field Definitions

1. **`title`** (string): The title configured in Step 1.
2. **`caption`** (string): The post description body from Step 2.
3. **`mediaFiles`** (array): Array containing media assets. If empty, an empty array is sent.
   - `name` (string): Filename of the asset.
   - `size` (number): Size in bytes.
   - `type` (string): MIME type (e.g. `image/png`).
   - `preview` (string): Direct base64 string data or file blob URL.
4. **`selectedPlatforms`** (array): Array of selected platforms in lowercase (e.g., `["linkedin", "facebook"]`).
5. **`scheduleTime`** (string | null):
   - When **Publish Now** is active: `null`.
   - When **Schedule for Later** is active: strict ISO 8601 string including timezone offset (e.g. `2026-07-20T18:30:00+05:30`).
6. **`user`** (object): Active workspace user credentials.
