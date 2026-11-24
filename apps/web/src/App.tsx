import { useEffect, useState } from 'react'
import './App.css'

export default function App() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getData() {;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/health`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }

      const data = await response.json();
      setStatus(data.status);
      console.log(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Request failed:", error.message);
        setError(error.message);
      }
    }
  } getData();
    }, [])




  return (
    <>
    {error && <div>Error: {error}</div>}
    
    <div>status: {status}</div>
    </>
  )
}


