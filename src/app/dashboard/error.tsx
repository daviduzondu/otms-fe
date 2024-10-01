'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'
import { FallbackProps } from 'react-error-boundary'

export default function ErrorWhenLoading({ error, resetErrorBoundary }: FallbackProps
) {
 useEffect(() => {
  // Log the error to an error reporting service
  console.error(error)
 }, [error])

 return (
  <div>
   <h2>Something went wrong!</h2>
   <button
    onClick={
     // Attempt to recover by trying to re-render the segment
     () => resetErrorBoundary()
    }
   >
    Try again
   </button>
  </div>
 )
}