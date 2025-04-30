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

// 登出逻辑
window.onload = function() {
  document.getElementById("logout-btn").onclick = function() {
    document.getElementById("user-info").style.display = "none";
    document.getElementById("user-info").innerHTML = "";
    document.querySelector(".g_id_signin").style.display = "block";
    this.style.display = "none";
    document.getElementById("error-message").style.display = "none";
    // 清除 Google 会话
    google.accounts.id.disableAutoSelect();
    google.accounts.id.revoke(localStorage.getItem('google_token'), done => {
      localStorage.removeItem('google_token');
    });
  };
};
