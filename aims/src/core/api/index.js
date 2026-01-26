import client from "./client";

// ... keep your other existing functions (fetchMyCourses, etc.) ...

// --- GLOBAL DATA (Fixed) ---
export const fetchGlobalData = async (type) => {
  try {
    const res = await client.get(`/global-data/${type}`);
    
    // FIX: The API returns { data: { items: [...] } }
    // So we access res.data (axios body) -> .data (your wrapper) -> .items
    return res.data.data?.items || []; 
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return [];
  }
};