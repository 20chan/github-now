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
                    const [artist, album, year] = infos;
                    const albumCoverImgSrc = res[2] as string;
                    const albumCoverImgOriginal = new RegExp("(.*)=.*").exec(albumCoverImgSrc)[1];
                    console.log(`${artist} - ${name}`);
                    console.log(`${album} at ${year}`);
                    console.log(`${albumCoverImgOriginal}`);
                });
            }
        });
    });
}