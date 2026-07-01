export async function uploadMedia(file: string) {
  return {
    url: "https://cdn.yourapp.com/" + file,
    type: "image",
    uploadedAt: new Date().toISOString()
  }
}
