interface PlayingInfo {
    name: string;
    artists: string;
    album: string;
    year: string;
    albumCoverImage: string;
    updatedAt: Date;
}

chrome.runtime.onInstalled.addListener(d => {
    chrome.alarms.create('refresh', { periodInMinutes: 1 });
    chrome.alarms.onAlarm.addListener(a => {
        if (a.name !== 'refresh') return;
        report();
    })
    report();
});

const report = () => {
    chrome.tabs.query({audible: true}, tabs => {
        tabs.forEach(t => {
            if (t.audible && t.url.startsWith('https://music.youtube.com/')) {
                chrome.tabs.executeScript(t.id, {
                    code: "[document.querySelector('yt-formatted-string.ytmusic-player-bar.title').innerText, document.querySelector('yt-formatted-string.ytmusic-player-bar.byline').title, document.querySelector('img.ytmusic-player-bar').src]"
                }, results => {
                    const res = results[0] as string[];
                    const name = res[0] as string;
                    const infos = (res[1] as string).split(" • ");
                    const [artists, album, year] = infos;
                    const albumCoverImgSrc = res[2] as string;
                    const albumCoverImgOriginal = new RegExp("(.*)=.*").exec(albumCoverImgSrc)[1];
                    update({
                        name,
                        artists,
                        album,
                        year,
                        albumCoverImage: albumCoverImgOriginal,
                        updatedAt: new Date(),
                    });
                });
            }
        });
    });
}

const update = (info: PlayingInfo) => {
    const id = "";
    const oauth = "";
    const message = "auto update by github-now";

    const auth = `token ${oauth}`;
    fetch(`https://api.github.com/repos/${id}/${id}/contents/README.template.md`, {
        headers: {
            "Authorization": auth
        },
    }).then(async resp => {
        const json = await resp.json();
        const template = decodeURIComponent(escape(atob(json.content)));
        // looks like need a template engine..
        const content = template
        .replace("{CURRENT_PLAYING_NAME}", info.name)
        .replace("{CURRENT_PLAYING_ARTISTS}", info.artists)
        .replace("{CURRENT_PLAYING_ALBUM}", info.album)
        .replace("{CURRENT_PLAYING_RELEASED}", info.year)
        .replace("{CURRENT_PLAYING_ALBUM_SRC}", info.albumCoverImage)
        .replace("{CURRENT_PLAYING_LAST_UPDATED}", info.updatedAt.toLocaleString());
        const encoded = btoa(unescape(encodeURIComponent(content)));
        const target = await fetch(`https://api.github.com/repos/${id}/${id}/contents/README.md`);
        const sha = (await target.json()).sha;
        const postResp = await fetch(`https://api.github.com/repos/${id}/${id}/contents/README.md`, {
            method: "PUT",
            headers: {
                "Authorization": auth
            },
            body: JSON.stringify({
                "message": message,
                "content": encoded,
                "sha": sha,
                "committer": {
                    "name": "github-now",
                    "email": "2+github-now@0chan.dev",
                },
            }),
        });

        if (postResp.ok) {
            console.log("updated");
        }
    })
}