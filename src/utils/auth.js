// Save token and role to localStorage
export const saveToken = (token, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
};

// Get token
export const getToken = () => localStorage.getItem('token');

// Get role
export const getRole = () => localStorage.getItem('role');

// Check if user is logged in
export const isLoggedIn = () => !!localStorage.getItem('token');

// Remove token on logout
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

// Disable back button after login (optional)
export const disableBackButton = () => {
  window.history.pushState(null, '', window.location.href);
  window.onpopstate = () => {
    window.history.pushState(null, '', window.location.href);
  };
};