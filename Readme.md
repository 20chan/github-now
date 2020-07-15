# github-now

![preview](/preview.png)

Update your profile with the song you are listening at youtube music, using chrome extensions, in real time.

## Howto

This project is under WIP, be careful when use;

1. Create and edit `README.Template.md` file in profile repository
2. Create github personal oauth token
3. Edit [background.ts](/src/background/background.ts), line 47 and 48, replace id and oauth token
4. `npm install && npm run build`
5. Install unpacked extension in chrome, `/dist`

## Templates

- `{CURRENT_PLAYING_NAME}`
- `{CURRENT_PLAYING_ARTISTS}`
- `{CURRENT_PLAYING_ALBUM}`
- `{CURRENT_PLAYING_RELEASED}`
- `{CURRENT_PLAYING_ALBUM_SRC}`
- `{CURRENT_PLAYING_LAST_UPDATED}`

## Todo

- [ ] Account/OAuth config via extension settings
- [ ] More platform than youtube music