function handleCredentialResponse(response) {
  const jwt = response.credential;
  
  // 显示前端解析的信息
  const userInfo = parseJwt(jwt);
  document.getElementById("user-info").innerHTML = `
    <p>欢迎，${userInfo.name}！</p>
    <p>邮箱：${userInfo.email}</p>
    <img src="${userInfo.picture}" alt="头像" style="width:80px;border-radius:50%;">
    <p class="status">验证中...</p>
  `;
  
  // 发送令牌到后端进行验证
  verifyTokenWithBackend(jwt);
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
    
    const statusElement = document.querySelector('#user-info .status');
    
    if (data.success) {
      statusElement.textContent = '✅ 验证成功';
      statusElement.style.color = 'green';
      console.log('后端验证成功:', data.user);
    } else {
      statusElement.textContent = '❌ 验证失败';
      statusElement.style.color = 'red';
      console.error('后端验证失败:', data.error);
    }
  } catch (error) {
    console.error('API请求错误:', error);
    const statusElement = document.querySelector('#user-info .status');
    statusElement.textContent = '❌ API请求错误';
    statusElement.style.color = 'red';
  }
}
