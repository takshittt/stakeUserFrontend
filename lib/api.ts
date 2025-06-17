declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
  };
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface ApiParams {
  url: string;
  params?: Record<string, any>;
  body?: any; // 👈 Add this line to allow body in POST requests
  headers?: Record<string, string>;
}

export const get = async ({ url, params }: ApiParams) => {
  try {
    console.log("API_URL + url", `${API_URL + url}`);
    const queryParams = params ? new URLSearchParams(params).toString() : "";
    const fullUrl = `${API_URL}${url}${queryParams ? `?${queryParams}` : ""}`;

    console.log("Fetching from:", fullUrl);

    const res = await fetch(fullUrl, {
      credentials: "include", // Needed for cookies
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}, ${await res.text()}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error; // Re-throw to allow component error handling
  }
};

export const post = async ({ url, params }: ApiParams) => {
  try {
    console.log("API_URL + url", `${API_URL + url}`);
    const fullUrl = `${API_URL}${url}`;

    console.log("Posting to:", fullUrl);

    const res = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include", // Needed for cookies
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}, ${await res.text()}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error posting to ${url}:`, error);
    throw error; // Re-throw to allow component error handling
  }
};
