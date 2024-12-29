import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
//import ReactGA from 'react-ga'

import { router } from './pages'

//ReactGA.initialize('UA-123454-1')

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
)
