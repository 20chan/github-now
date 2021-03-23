import { format } from 'fecha';

interface PlayingInfo {
    src: 'YTMusic' | 'SoundCloud' | 'Spotify' | 'YouTube' | 'Jamendo';
    name: string;
    artists: string;
    album?: string;
    year?: string;
    url?: string;
    albumCoverImage: string;
    updatedAt: Date;
    liked?: boolean;
}

const enable = () => {
    chrome.storage.local.set({ enabled: true }, () => {
        chrome.alarms.create('refresh', { periodInMinutes: 1 });
        report();
        chrome.browserAction.setIcon({ path: '/assets/24.png' });
    });
};

const disable = () => {
    chrome.storage.local.set({ enabled: false }, () => {
        chrome.alarms.clear('refresh');
        chrome.browserAction.setIcon({ path: '/assets/24-grayscale.png' });
    });
}

chrome.alarms.onAlarm.addListener(a => {
    if (a.name !== 'refresh') return;
    report();
});

chrome.browserAction.onClicked.addListener(tab => {
    chrome.storage.local.get(['enabled'], items => {
        if (items.enabled === true) {
            disable();
        } else if (items.enabled === false || items.enabled === undefined) {
            enable();
        }
    });
});

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.data === 'manualReport') {
        report();
    }
    if (message.data === 'enabled') {
        enable();
    }
    if (message.data === 'disabled') {
        disable();
    }
});

chrome.storage.local.get(['enabled'], items => {
    if (items.enabled === true) {
        enable();
    } else {
        disable();
    }
});

const report = () => {
    chrome.tabs.query({ audible: true }, tabs => {
        var updated = false;
        const tryupdate = (info: PlayingInfo) => {
            if (updated) {
                return;
            }

            chrome.storage.local.get(['last'], res => {
                const last = res.last as PlayingInfo;
                if (last !== undefined) {
                    if (last.src === info.src && last.name === info.name && last.artists === info.artists) {
                        return;
                    }
                }

                update(info).then(succeed => {
                    if (succeed) {
                        chrome.storage.local.set({ last: info });
                        updated = true;
                    }
                });
            });
        }
        tabs.forEach(t => {
            if (t.audible && t.url.startsWith('https://soundcloud.com/')) {
                chrome.tabs.executeScript(t.id, {
                    code: `[
                        document.querySelector('.playControls__soundBadge .playbackSoundBadge__titleLink').title,
                        document.querySelector('.playControls__soundBadge .playbackSoundBadge__lightLink').title,
                        document.querySelector('.playControls__soundBadge .playbackSoundBadge__titleLink').href,
                        document.querySelector('.playControls__soundBadge span.sc-artwork').style.backgroundImage,
                        document.querySelector('.playbackSoundBadge__actions .sc-button-like').getAttribute('aria-label'),
                    ]`
                }, results => {
                    const res = results[0] as string[];
                    const [name, artists, url, albumCoverImg, likeLabel] = res;
                    const albumCoverImgSmallSrc = new RegExp('url\\(\\"(.*)\\"\\)').exec(albumCoverImg)[1];
                    const albumCoverImgBigSrc = (albumCoverImgSmallSrc || '').replace('50x50', '500x500');
                    const liked = likeLabel === 'Unlike';
                    tryupdate({
                        src: 'SoundCloud',
                        name,
                        artists,
                        url,
                        albumCoverImage: albumCoverImgBigSrc,
                        updatedAt: new Date(),
                        liked,
                    });
                });
            }
            if (t.audible && t.url.startsWith('https://music.youtube.com/')) {
                chrome.tabs.executeScript(t.id, {
                    code: `[
                        document.querySelector('yt-formatted-string.ytmusic-player-bar.title').innerText,
                        document.querySelector('yt-formatted-string.ytmusic-player-bar.byline').title,
                        document.querySelector('img.ytmusic-player-bar').src,
                        document.querySelector('.ytp-title-link').href,
                        document.querySelector('paper-icon-button.like').getAttribute('aria-pressed'),
                    ]`
                }, results => {
                    const res = results[0] as string[];
                    const name = res[0];
                    const infos = res[1].split(" • ");
                    const [artists, album, year] = infos;
                    const albumCoverImgSrc = res[2];
                    const albumCoverImgOriginal = new RegExp('(.*)=.*').exec(albumCoverImgSrc)[1];
                    const ytMediaUrl = res[3];
                    const url = `https://music.youtube.com/watch?v=${new RegExp('.*=(.*)').exec(ytMediaUrl)[1]}`;
                    const liked = res[4] === 'true';
                    tryupdate({
                        src: 'YTMusic',
                        name,
                        artists,
                        album,
                        year,
                        url,
                        albumCoverImage: albumCoverImgOriginal,
                        updatedAt: new Date(),
                        liked: liked,
                    });
                });
            }
            if (t.audible && t.url.startsWith('https://open.spotify.com/')) {
                chrome.tabs.executeScript(t.id, {
                    /* 
                     * Spotify web player doesn't give album and year information
                     * TrackName
                     * Artists
                     * Cover Image URL (currently there are several images in different resolutions, workaround needed)
                     * Track Album Link
                     */
                    code: `[
                        document.querySelector('a[data-testid="nowplaying-track-link"]').innerText,
                        [...document.querySelectorAll('div[class="Root__top-container"] div[class="now-playing-bar"] span span a')].map(x => x.innerText),
                        document.querySelector('div[class*="cover-art shadow"] img').src,
                        document.querySelector('a[data-testid="nowplaying-track-link"]').href
                    ]`
                }, results => {
                    const name = results[0][0];
                    const artists = (results[0][1] as string[]).join(' ');
                    const albumCoverImage = results[0][2];
                    const url = results[0][3];
                    tryupdate({
                        src: 'Spotify',
                        name,
                        artists,
                        url,
                        albumCoverImage,
                        updatedAt: new Date(),
                    });
                });
            }
            if (t.audible && t.url.startsWith('https://www.youtube.com/')) {
                chrome.tabs.executeScript(t.id, {
                    code: `[
                        document.querySelector('.title.ytd-video-primary-info-renderer').innerText,
                        document.querySelector('ytd-video-secondary-info-renderer ytd-channel-name').innerText,
                        document.querySelector('ytd-video-secondary-info-renderer ytd-video-owner-renderer img').src,
                        document.querySelector('ytd-video-secondary-info-renderer ytd-video-owner-renderer a').href,
                        document.querySelector('ytd-video-primary-info-renderer yt-icon-button button')?.getAttribute('aria-pressed'),
                        (!!document.querySelector('ytd-video-secondary-info-renderer ytd-video-owner-renderer .badge-style-type-verified-artist')).toString(),
                    ]`
                }, results => {
                    const res = results[0] as string[];
                    const verified = res[5];
                    if (verified === 'true') {
                        const artists = res[1];
                        const name = res[0].replace(artists + " - ", ""); // Remove artist from music title.
                        const albumCoverImage = res[2];
                        const url = res[3];
                        const liked = res[4] === 'true';
                        tryupdate({
                            src: 'YouTube',
                            name,
                            artists,
                            url,
                            albumCoverImage,
                            updatedAt: new Date(),
                            liked: liked,
                        });
                    }
                });
            }
            if (t.audible && t.url.startsWith('https://www.jamendo.com/')) {
                chrome.tabs.executeScript(t.id, {
                    code: `[
                        document.getElementsByClassName('player-mini_track_information_title js-player-name')[0].innerText,
                        document.getElementsByClassName('player-mini_track_information_artist js-player-artistId')[0].innerText,
                        new URL(new URL(document.getElementsByClassName('js-full-player-cover-img')[0].src).pathname.split("/")[3] + '/' + document.getElementsByClassName('player-mini_track_information_title js-player-name')[0].innerText.replace("(", "").replace(")", ""), 'https://www.jamendo.com/track/').href,
                        document.getElementsByClassName('js-full-player-cover-img')[0].src,
                        (document.getElementsByClassName('btn-icon btn--overlay is-on')[0] != undefined).toString(),
                    ]`
                }, results => {
                    const res = results[0] as string[];
                    const name = res[0];
                    const artists = res[1];
                    const url = res[2];
                    const albumCoverImg = res[3].split("?")[0];
                    const liked = (res[4] == "true");

                    tryupdate({
                        src: 'Jamendo',
                        name,
                        artists,
                        url,
                        albumCoverImage: albumCoverImg,
                        updatedAt: new Date(),
                        liked,
                    });
                });
            }
        });
    });
}

const update = (info: PlayingInfo): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
        chrome.storage.local.get(['id', 'key', 'etag', 'modified'], items => {
            const id = items.id as string;
            const oauth = items.key as string;
            const lastEtag = items.etag as string;
            const lastModified = items.modified as string;
            const message = 'auto update by github-now';
            const auth = `token ${oauth}`;
            try {
                fetch(`https://api.github.com/repos/${id}/${id}/contents/README.template.md`, {
                    headers: {
                        "Authorization": auth
                    },
                }).then(async resp => {
                    const json = await resp.json();

                    if (resp.status !== 200) {
                        console.error(json.message);
                        return;
                    }

                    const template = decodeURIComponent(escape(atob(json.content)));
                    // looks like need a template engine..
                    const content = template
                        .replace(/{CURRENT_PLAYING_SOURCE}/gi, info.src)
                        .replace(/{CURRENT_PLAYING_NAME}/gi, info.name)
                        .replace(/{CURRENT_PLAYING_ARTISTS}/gi, info.artists)
                        .replace(/{CURRENT_PLAYING_ALBUM}/gi, info.album ?? 'Not supported')
                        .replace(/{CURRENT_PLAYING_RELEASED}/gi, info.year)
                        .replace(/{CURRENT_PLAYING_ALBUM_SRC}/gi, info.albumCoverImage)
                        .replace(/{CURRENT_PLAYING_URL}/gi, info.url)
                        .replace(/{CURRENT_PLAYING_LAST_UPDATED}/gi, format(info.updatedAt, 'MM/DD/YYYY HH:mm'));
                    const encoded = btoa(unescape(encodeURIComponent(content)));
                    const headers = !lastEtag ? {} : {
                        "If-Modified-Since": lastModified,
                        "If-None-Match": lastEtag,
                    };
                    const target = await fetch(`https://api.github.com/repos/${id}/${id}/contents/README.md`, {
                        headers,
                    });
                    const etag = target.headers.get("ETag");
                    const modified = target.headers.get("Last-Modified");
                    chrome.storage.local.set({ etag, modified });

                    if (target.status === 304) {
                        console.log("got cached; retry after 1 second");
                        setTimeout(report, 1000);
                        resolve(false);
                        return;
                    }

                    const sha = (await target.json()).sha;
                    try {
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

                        if (postResp.status === 409) {
                            console.log("cached");
                            resolve(false);
                            return;
                        }

                        if (postResp.status !== 200) {
                            const postJson = await postResp.json();
                            console.error(postJson.message);
                            resolve(false);
                            return;
                        }

                        if (postResp.ok) {
                            resolve(true);
                            console.log("updated");
                            return;
                        }
                        resolve(false);
                    } catch (postResp) {
                        console.log(`Error ${postResp}`);
                        resolve(false);
                    }
                });
            } catch {
                resolve(false);
            }
        });
    });
}