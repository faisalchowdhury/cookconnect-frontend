"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { makeStore } from "../redux/store";

export default function StoreProvider({ children }) {
  // A lazy useState initializer creates the store exactly once per mount without
  // reading or writing a ref during render, which React 19 disallows.
  const [store] = useState(makeStore);

  // Rehydration is a browser-only side effect, so it belongs in an effect rather
  // than in the render path.
  useEffect(() => {
    const persistor = persistStore(store);
    return () => {
      persistor.pause();
    };
  }, [store]);

  // PersistGate deliberately removed.
  //
  // It renders its `loading` element instead of the children until rehydration
  // finishes, and rehydration never happens during server rendering. The result
  // was that every page served an empty shell and only filled in after the
  // client bundle hydrated — no server-rendered content for search engines and a
  // blank first paint on mobile, which is the opposite of what this project
  // needs (the client expects most traffic on phones).
  //
  // Rehydration still runs above; we simply no longer block painting on it. Any
  // component that must wait for persisted state should handle that locally
  // rather than gating the whole tree.
  return <Provider store={store}>{children}</Provider>;
}
