# github-now

![preview](/preview.png)

Update your profile with the song you are listening, using chrome extensions, in real time.

## Supported Platforms

- Youtube Music
- Soundcloud
- Spotify

## Howto

Beware it's WIP project;

1. Create and edit `README.template.md` file in profile repository
2. Create github personal oauth token with `repo` scopes
3. Edit [background.ts](/src/background/background.ts), line 123 and 124, replace id and oauth token
4. `npm install && npm run build`
5. Install unpacked extension in chrome, `/dist`

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

- [ ] Account/OAuth config via extension settings
- [ ] Template file name via extension settings
- [ ] DateTime format with template engine supports
- [ ] More platform than youtube music

## Known Issues

### Unchecked runtime.lastError: The tab was closed

Maybe tab iterating related

### javascript chrome.tabs.executescript Cannot read property '0' of undefined

Sometimes `chrome.tabs.executeScript` returns empty array
