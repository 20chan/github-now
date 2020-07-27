# github-now

![banner](/banner.png)

Update your profile with the song you are listening, using chrome extensions, in real time.

![preview](/preview.png)

## Supported Platforms

- Youtube Music
- Soundcloud
- Spotify

## Howto

1. Create and edit `README.template.md` file in profile repository
2. Create github personal oauth token with `repo` scopes
3. Download latest release from [Releases](https://github.com/20chan/github-now/releases), and unzip into empty directory
3. In the `chrome://extensions/` page, click the Load unpacked extension and select unzipped directory
4. Go to extension option page and fill `id` and `oauth key` field and click save
5. You're done!

## Downloads

Latest 1.0.1 is available on [Releases](https://github.com/20chan/github-now/releases).

> I published github-now to Chrome Web Store publication and it will take times.

## Templates

- `{CURRENT_PLAYING_SOURCE}`
- `{CURRENT_PLAYING_NAME}`
- `{CURRENT_PLAYING_ARTISTS}`
- `{CURRENT_PLAYING_ALBUM}`
- `{CURRENT_PLAYING_RELEASED}`
- `{CURRENT_PLAYING_ALBUM_SRC}`
- `{CURRENT_PLAYING_URL}`
- `{CURRENT_PLAYING_LAST_UPDATED}`

## Todo

- [x] Account/OAuth config via extension settings
- [ ] Template file name via extension settings
- [ ] DateTime format with template engine supports
- [ ] More platform than youtube music

## Known Issues

### Unchecked runtime.lastError: The tab was closed

Maybe tab iterating related

### javascript chrome.tabs.executescript Cannot read property '0' of undefined

Sometimes `chrome.tabs.executeScript` returns empty array
