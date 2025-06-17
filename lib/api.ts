export const API_URL = `https://stake.mindwavedao.com/api`;
// export const API_URL = `http://localhost:8000/api`

export interface ApiParams {
  url: string;
  params?: Record<string, any>;
  body?: any; // 👈 Add this line to allow body in POST requests
  headers?: Record<string, string>;
}

export const get = async ({ url, params }: ApiParams) => {
  console.log("API_URL + url", `${API_URL + url}`);
  try {
    const queryParams = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}${url}?${queryParams}`, {
      credentials: "include", // Needed for cookies
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API fetch error:", error);
    console.error(
      "⚠️ CORS Issue: The API at stake.mindwavedao.com is configured to only accept requests from http://localhost:8000"
    );
    console.error(
      "⚠️ Your app is running on http://localhost:3000, which is being blocked by CORS policy"
    );
    console.error(
      "⚠️ To fix this, the API server needs to add http://localhost:3000 to its allowed origins"
    );

    // Return appropriate default responses based on the endpoint
    if (url.includes("isLoggedIn")) {
      return { loggedIn: false };
    }
    if (url.includes("getUserSession")) {
      return { loggedIn: false };
    }
    if (url.includes("login")) {
      return {
        loggedIn: false,
        message:
          "CORS error: API only accepts requests from http://localhost:8000",
      };
    }

    // For other endpoints, return empty object
    return {};
  }
};

export const post = async ({ url, params }: ApiParams) => {
  console.log("API_URL + url", `${API_URL + url}`);
  try {
    const res = await fetch(API_URL + url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Needed for cookies
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API fetch error:", error);
    console.error(
      "⚠️ CORS Issue: The API at stake.mindwavedao.com is configured to only accept requests from http://localhost:8000"
    );
    console.error(
      "⚠️ Your app is running on http://localhost:3000, which is being blocked by CORS policy"
    );

    // Return appropriate default responses
    if (url.includes("login")) {
      return {
        loggedIn: false,
        message:
          "CORS error: API only accepts requests from http://localhost:8000",
      };
    }
    if (url.includes("logout")) {
      return { success: false };
    }

    // For other endpoints, return empty object
    return {};
  }
};
