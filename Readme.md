# github-now

![banner](/banner.png)

Generate Github profile with current listening music as a web browser extension for chrome.

![preview](/preview.png)

## Supported Platforms

- YouTube
- Youtube Music
- Soundcloud
- Spotify
- Jamendo Music

## Howto

1. Create and edit `README.template.md` file in profile repository
2. Create github personal oauth token with `repo` scopes
3. Download latest release from [Releases](https://github.com/20chan/github-now/releases), and unzip into empty directory
3. In the `chrome://extensions/` page, click the Load unpacked extension and select unzipped directory
4. Go to extension option page and fill `id` and `oauth key` field and click save
5. You're done!

## Downloads

You can download official latest version at [Chrome Web Store](https://chrome.google.com/webstore/detail/github-now/kokofjekemkckglmfpnoanadmjolbanj).

Unzipped latest 1.0.6 is available on [Releases](https://github.com/20chan/github-now/releases).

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
