const BASE_URL = 'https://api.upload-post.com/api';

/**
 * Call UploadPost API to create a new user profile container.
 */
export async function createUserProfile(username, apiKey) {
  if (!username || !apiKey) return false;
  
  const response = await fetch(`${BASE_URL}/uploadposts/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Apikey ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // If conflict (409), the user profile already exists, which is acceptable
    if (response.status !== 409) {
      throw new Error(errorData.message || `Failed to create profile: ${response.statusText}`);
    }
  }

  return true;
}

/**
 * Generate a temporary JWT-backed URL to redirect users to link their channels.
 */
export async function generateJwtUrl(username, apiKey) {
  if (!username || !apiKey) {
    throw new Error('Username and API key are required to generate JWT URL.');
  }

  const response = await fetch(`${BASE_URL}/uploadposts/users/generate-jwt`, {
    method: 'POST',
    headers: {
      'Authorization': `Apikey ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      redirect_url: window.location.origin + '?action=connected',
      platforms: ['tiktok', 'instagram', 'youtube', 'linkedin', 'facebook', 'twitter', 'pinterest']
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to generate JWT URL: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_url || data.url;
}

/**
 * Retrieve all user profiles and extract connection status for a username.
 */
export async function getUserProfile(username, apiKey) {
  if (!username || !apiKey) return null;

  const response = await fetch(`${BASE_URL}/uploadposts/users`, {
    method: 'GET',
    headers: {
      'Authorization': `Apikey ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch user profiles: ${response.statusText}`);
  }

  const data = await response.json();
  const profiles = Array.isArray(data) ? data : (data.profiles || []);
  const profile = profiles.find(p => p.username === username);
  if (!profile) {
    throw new Error(`Profile ${username} not found on UploadPost.`);
  }
  return profile;
}
