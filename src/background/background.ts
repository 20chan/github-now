chrome.runtime.onInstalled.addListener(d => {
    chrome.alarms.create('refresh', { periodInMinutes: 1 });
    chrome.alarms.onAlarm.addListener(a => {
        if (a.name !== 'refresh') return;

        chrome.tabs.query({audible: true}, tabs => {
            tabs.forEach(t => {
                if (t.audible && t.url.startsWith('https://music.youtube.com/')) {
                    chrome.tabs.executeScript(t.id, {
                        code: "[document.querySelector('yt-formatted-string.ytmusic-player-bar.title').innerText, document.querySelector('yt-formatted-string.ytmusic-player-bar.byline').title]"
                    }, results => {
                        console.log(`${results[0]}\t${results[1]}`);
                    });
                }
            });
        });
    })
});