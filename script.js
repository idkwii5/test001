function handleCredentialResponse(response) {
  const jwt = response.credential;
  const userInfo = parseJwt(jwt);
  document.getElementById("user-info").innerHTML = `
    <p>欢迎，${userInfo.name}！</p>
    <p>邮箱：${userInfo.email}</p>
    <img src="${userInfo.picture}" alt="头像" style="width:80px;border-radius:50%;">
  `;
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
