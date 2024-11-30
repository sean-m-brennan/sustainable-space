import React, {StrictMode} from 'react'
import {createRoot} from "react-dom/client"

import {imageFiles} from "space-sim/components/images"

export function App() {
    console.log(imageFiles.splash)
    return (
        <div style={{backgroundImage: imageFiles.splash, width: "100%", height: "100%", backgroundSize: "contain"}}>
            <h1>Sustainable Space</h1>
            <h3>About</h3>
        </div>
    )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
