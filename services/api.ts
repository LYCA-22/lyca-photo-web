const API_BASE_URL = "https://api.lyhsca.org/v1";

export const apiService = {
  async getAllPhotos(date: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/photos/${date}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      throw new Error("Failed to fetch photos");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
