import React from 'react';
import './App.css';

const App = () => {
  const [id, setId] = React.useState('');
  const [key, setKey] = React.useState('');

  const sync = () => {
    chrome.storage.local.set({ id, key }, () => {
      chrome.runtime.sendMessage('optionChanged');
      console.log("id and key saved");
    });
  }

  React.useEffect(() => {
    chrome.storage.local.get(['id', 'key'], res => {
      setId(res.id);
      setKey(res.key);
    });
  }, []);

  return (
    <div>
      <label>
        <span>id</span>
        <input onChange={c => setId(c.currentTarget.value)} value={id} />
      </label>
      <label>
        <span>oauth key</span>
        <input onChange={c => setKey(c.currentTarget.value)} value={key} />
      </label>

      <button onClick={sync}>Save</button>
    </div>
  )
}

export default App;
