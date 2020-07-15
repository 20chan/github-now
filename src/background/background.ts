chrome.runtime.onInstalled.addListener(d => {
    chrome.alarms.create('refresh', { periodInMinutes: 1 });
    chrome.alarms.onAlarm.addListener(a => {
        if (a.name !== 'refresh') return;

        chrome.tabs.query({audible: true}, tabs => {
            tabs.forEach(t => {
                if (t.audible && t.url.startsWith('https://music.youtube.com/')) {
                    console.log(t.title);
                }
            });
        });
    })
});