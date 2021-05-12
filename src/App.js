import { useEffect, useRef, useState } from "react";
import "./App.css";
import tabex from "tabex";
import { nanoid } from 'nanoid'

// active : 0 means unset
// active : 1 means this tab is active
// active : -1 means this tab is not set as active

// const browserId = (() => nanoid())();

export default function App() {
  const tabexRef = useRef();
  const [active, setActive] = useState(true);
  const [hasMultipleInstance, setHasMultipleInstance] = useState(false);
  const instanceRef = useRef({
    id: nanoid(),
    registeredIds: [],
  });

  const handleSomeoneElseActive = ({ browserId }) => {
    if(browserId !== instanceRef.current.id) {
      setActive(false);
    }
  };

  const handleActivateCurrentTab = () => {
    tabexRef.current.emit('someone-else-active', { browserId: instanceRef.current.id });
  };

  const emithandleMultipleTabsOpens = (browserId) => {
    tabexRef.current.emit('is-multiple-tabs-open', { browserId });
  };

  const useMe = () => {
    setActive(true);
    handleActivateCurrentTab();
  };
  const handleMultipleTabsOpen = ({ browserId }) => {
    setHasMultipleInstance(true);
    if(!instanceRef.current.registeredIds.includes(browserId)) {
      instanceRef.current.registeredIds.push(browserId)
      emithandleMultipleTabsOpens(browserId);
    }
  };
  useEffect(() => {
    tabexRef.current = tabex.client();
    // tabexRef.current.on('init-tabex', handleMultiTabCallback);

    tabexRef.current.on('someone-else-active', handleSomeoneElseActive);
    tabexRef.current.on('is-multiple-tabs-open', handleMultipleTabsOpen);

    handleActivateCurrentTab();
    emithandleMultipleTabsOpens(instanceRef.current.id);
    return () => {
      tabexRef.current.off('someone-else-active', handleSomeoneElseActive);
      tabexRef.current.off('is-multiple-tabs-open', handleMultipleTabsOpen);
    };
  }, []);
  return (
    <div className="App">
      {hasMultipleInstance ?
        <h1> Multiple Tabs are open </h1> :
        <h1> <a href={ window.location.href } target="_blank" rel="noreferrer">Click Here</a> to open new tab </h1>
      }
      {!active && <button onClick={useMe}> Use this Tab</button>}
    </div>
  );
}
