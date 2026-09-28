const API_BASE_URL = "http://localhost:5000/api";

const request = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
      ...options,
    });

    const contentType =
      response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message =
        typeof data === "object" && data?.message
          ? data.message
          : typeof data === "object" && data?.error
            ? data.error
            : `Request failed: ${response.status}`;

      throw new Error(message);
    }

    return data;

  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Failed to fetch API: ${API_BASE_URL}`
      );
    }

    throw error;
  }
};

const api = {
  get: (endpoint) =>
    request(endpoint, {
      method: "GET",
    }),

  post: (endpoint, data) => {
    const isFormData = data instanceof FormData;

    return request(endpoint, {
      method: "POST",

      ...(isFormData
        ? {}
        : {
            headers: {
              "Content-Type": "application/json",
            },
          }),

      body: isFormData
        ? data
        : JSON.stringify(data),
    });
  },

  put: (endpoint, data) => {
    const isFormData = data instanceof FormData;

    return request(endpoint, {
      method: "PUT",

      ...(isFormData
        ? {}
        : {
            headers: {
              "Content-Type": "application/json",
            },
          }),

      body: isFormData
        ? data
        : JSON.stringify(data),
    });
  },

  delete: (endpoint) =>
    request(endpoint, {
      method: "DELETE",
    }),
};

export { API_BASE_URL };
export default api;
