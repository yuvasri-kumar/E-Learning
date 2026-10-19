import client from "./client";

export async function loginRequest(identifier, password) {
  const { data } = await client.post("/auth/login", { identifier, password });
  return data;
}

export async function registerRequest(student) {
  const { data } = await client.post("/auth/register", student);
  return data;
}

export async function fetchCurrentUser(signal) {
  const { data } = await client.get("/auth/me", { signal });
  return data.user;
}

// The token is passed explicitly because the caller clears local storage first.
export async function logoutRequest(token) {
  await client.post(
    "/auth/logout",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
