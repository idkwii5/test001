// 初始化 Google 登录
function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: "301486741518-pcsrdrp9jl5p67vah5n5ht7aa8no1nv6.apps.googleusercontent.com",
    callback: handleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: true
  });
}

// 显示 Google 登录按钮
function showGoogleSignIn() {
  google.accounts.id.renderButton(
    document.querySelector(".g_id_signin"),
    { theme: "outline", size: "large", text: "sign_in_with", shape: "rectangular" }
  );
  document.querySelector(".g_id_signin").style.display = "block";
}

function handleCredentialResponse(response) {
  if (!response.credential) {
    showError('登录失败，请重试');
    return;
  }

  const jwt = response.credential;
  try {
    const userInfo = parseJwt(jwt);
    document.getElementById("user-info").innerHTML = `
      <p>欢迎，${userInfo.name}！</p>
      <p>邮箱：${userInfo.email}</p>
      <img src="${userInfo.picture}" alt="头像" style="width:80px;border-radius:50%;margin-top:10px;">
    `;
    document.getElementById("user-info").style.display = "block";
    document.querySelector(".g_id_signin").style.display = "none";
    document.getElementById("logout-btn").style.display = "inline-block";
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("error-message").style.display = "none";
  } catch (error) {
    console.error('登录处理错误:', error);
    showError('登录处理失败，请重试');
  }
}

// 显示错误信息
function showError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
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

// 页面加载完成后的初始化
window.onload = function() {
  initializeGoogleSignIn();
  
  // 登录按钮点击事件
  document.getElementById("login-btn").onclick = function() {
    showGoogleSignIn();
  };
  
  // 登出按钮点击事件
  document.getElementById("logout-btn").onclick = function() {
    document.getElementById("user-info").style.display = "none";
    document.getElementById("user-info").innerHTML = "";
    document.querySelector(".g_id_signin").style.display = "none";
    document.getElementById("login-btn").style.display = "block";
    this.style.display = "none";
    document.getElementById("error-message").style.display = "none";
    // 清除 Google 会话
    google.accounts.id.disableAutoSelect();
    google.accounts.id.revoke(localStorage.getItem('google_token'), done => {
      localStorage.removeItem('google_token');
    });
  };
};
