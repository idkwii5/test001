// Initialize Google Sign-In
function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: "301486741518-pcsrdrp9jl5p67vah5n5ht7aa8no1nv6.apps.googleusercontent.com",
    callback: handleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: true
  });
}

// Show Google Sign-In button
function showGoogleSignIn() {
  google.accounts.id.renderButton(
    document.querySelector(".g_id_signin"),
    { theme: "outline", size: "large", text: "sign_in_with", shape: "rectangular" }
  );
  document.querySelector(".g_id_signin").style.display = "block";
}

function handleCredentialResponse(response) {
  if (!response.credential) {
    showError('Login failed, please try again');
    return;
  }

  const jwt = response.credential;
  try {
    const userInfo = parseJwt(jwt);
    document.getElementById("user-info").innerHTML = `
      <p>Welcome, ${userInfo.name}!</p>
      <p>Email: ${userInfo.email}</p>
      <img src="${userInfo.picture}" alt="Profile" style="width:80px;border-radius:50%;margin-top:10px;">
    `;
    document.getElementById("user-info").style.display = "block";
    document.querySelector(".g_id_signin").style.display = "none";
    document.getElementById("logout-btn").style.display = "inline-block";
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("error-message").style.display = "none";
  } catch (error) {
    console.error('Login processing error:', error);
    showError('Login processing failed, please try again');
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

// Decode JWT function
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

// Initialize after page load
window.onload = function() {
  initializeGoogleSignIn();
  
  // Login button click event
  document.getElementById("login-btn").onclick = function() {
    showGoogleSignIn();
  };
  
  // Logout button click event
  document.getElementById("logout-btn").onclick = function() {
    document.getElementById("user-info").style.display = "none";
    document.getElementById("user-info").innerHTML = "";
    document.querySelector(".g_id_signin").style.display = "none";
    document.getElementById("login-btn").style.display = "block";
    this.style.display = "none";
    document.getElementById("error-message").style.display = "none";
    // Clear Google session
    google.accounts.id.disableAutoSelect();
    google.accounts.id.revoke(localStorage.getItem('google_token'), done => {
      localStorage.removeItem('google_token');
    });
  };
};
