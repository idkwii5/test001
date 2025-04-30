// 配置参数
const CONFIG = {
  client_id: "301486741518-pcsrdrp9jl5p67vah5n5ht7aa8no1nv6.apps.googleusercontent.com",
  redirect_uri: window.location.origin + "/auth/callback" // 动态获取当前域名
};

// 初始化 Google Sign-In
function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: CONFIG.client_id,
    callback: handleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: true
  });
  
  // 渲染Google登录按钮
  if (document.querySelector(".g_id_signin")) {
    google.accounts.id.renderButton(
      document.querySelector(".g_id_signin"),
      { theme: "outline", size: "large", text: "sign_in_with", shape: "rectangular" }
    );
  }
}

// 处理Google认证响应
function handleCredentialResponse(response) {
  if (!response.credential) {
    showError('Login failed, please try again');
    return;
  }

  const jwt = response.credential;
  
  // 存储令牌
  localStorage.setItem('google_token', jwt);
  
  // 前端显示用户信息
  displayUserInfo(jwt);
  
  // 后端验证令牌（可选）
  verifyTokenWithBackend(jwt);
}

// 显示用户信息
function displayUserInfo(jwt) {
  try {
    const userInfo = parseJwt(jwt);
    const userInfoContainer = document.getElementById("user-info");
    
    if (userInfoContainer) {
      userInfoContainer.innerHTML = `
        <p>Welcome, ${userInfo.name}!</p>
        <p>Email: ${userInfo.email}</p>
        <img src="${userInfo.picture}" alt="Profile" style="width:80px;border-radius:50%;margin-top:10px;">
      `;
      userInfoContainer.style.display = "block";
      
      // 更新其他UI元素
      const gSignin = document.querySelector(".g_id_signin");
      const loginBtn = document.getElementById("login-btn");
      const logoutBtn = document.getElementById("logout-btn");
      const errorMsg = document.getElementById("error-message");
      
      if (gSignin) gSignin.style.display = "none";
      if (loginBtn) loginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "inline-block";
      if (errorMsg) errorMsg.style.display = "none";
    }
  } catch (error) {
    console.error('Login processing error:', error);
    showError('Login processing failed, please try again');
  }
}

// 发送令牌到后端进行验证
async function verifyTokenWithBackend(token) {
  try {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Backend verification successful:', data.user);
      // 可以在这里执行额外操作，如保存用户会话等
    } else {
      console.error('Backend verification failed:', data.error);
      showError('Account verification failed');
      logout(); // 验证失败时登出
    }
  } catch (error) {
    console.error('API request error:', error);
  }
}

// 显示错误信息
function showError(message) {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  } else {
    console.error(message);
  }
}

// 登出功能
function logout() {
  // 清除UI
  const userInfo = document.getElementById("user-info");
  const gSignin = document.querySelector(".g_id_signin");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const errorMsg = document.getElementById("error-message");
  
  if (userInfo) {
    userInfo.style.display = "none";
    userInfo.innerHTML = "";
  }
  if (gSignin) gSignin.style.display = "none";
  if (loginBtn) loginBtn.style.display = "block";
  if (logoutBtn) logoutBtn.style.display = "none";
  if (errorMsg) errorMsg.style.display = "none";
  
  // 清除Google会话
  google.accounts.id.disableAutoSelect();
  const token = localStorage.getItem('google_token');
  if (token) {
    google.accounts.id.revoke(token, () => {
      localStorage.removeItem('google_token');
      console.log('Logged out successfully');
    });
  }
}

// 解码 JWT 函数
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

// 页面加载完成后初始化
window.onload = function() {
  // 初始化 Google 登录
  if (typeof google !== 'undefined' && google.accounts) {
    initializeGoogleSignIn();
  } else {
    console.error('Google Identity Services not loaded');
  }
  
  // 登录按钮事件
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.onclick = function() {
      // 如果在主页，跳转到注册页
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.location.href = 'register.html';
      } else {
        // 显示Google登录按钮
        const gSignin = document.querySelector(".g_id_signin");
        if (gSignin) gSignin.style.display = "block";
      }
    };
  }
  
  // 登出按钮事件
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.onclick = function() {
      logout();
    };
  }

  // 传统Google登录按钮
  const googleBtn = document.getElementById('google-login-btn');
  if (googleBtn) {
    googleBtn.onclick = function(e) {
      e.preventDefault();
      // 优先使用Google Identity Services
      if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.prompt();
      } else {
        // 备用：传统OAuth流程
        window.location.href =
          `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CONFIG.client_id}&redirect_uri=${encodeURIComponent(CONFIG.redirect_uri)}&response_type=token&scope=openid%20email%20profile`;
      }
    };
  }
  
  // 检查是否已有存储的令牌
  const storedToken = localStorage.getItem('google_token');
  if (storedToken) {
    try {
      // 显示用户信息
      displayUserInfo(storedToken);
      // 验证令牌
      verifyTokenWithBackend(storedToken);
    } catch (error) {
      console.error('Stored token error:', error);
      logout(); // 令牌无效，执行登出
    }
  }
};