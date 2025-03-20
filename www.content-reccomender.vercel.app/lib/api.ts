// Base URL for the Flask backend
const API_BASE_URL = "http://localhost:5000"

// Function to search for videos
export async function searchVideos(query: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error searching videos:", error)
    throw error
  }
}

// Function to upload a video
export async function uploadVideo(file: File) {
  try {
    const formData = new FormData()
    formData.append("video", file)

    const response = await fetch(`${API_BASE_URL}/upload_video`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error uploading video:", error)
    throw error
  }
}

// Function to get video URL
export function getVideoUrl(videoId: string) {
  return `${API_BASE_URL}/video/${videoId}`
}

