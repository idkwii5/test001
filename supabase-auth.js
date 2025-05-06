// Supabase 配置
const SUPABASE_CONFIG = {
  url: 'https://himmafxcmglkpnrujzci.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbW1hZnhjbWdsa3BucnVqemNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwOTM4ODAsImV4cCI6MjA2MTY2OTg4MH0.CUP3Bf46hy-C6Wo5YzhRVOYCc7jwxohkhAi1hPqBk8k',
  // 修改为匹配 vercel.json 路由的回调 URL
  redirectUrl: window.location.origin + '/auth/callback'
};

// 初始化 Supabase 客户端 - 修复了客户端创建方法
const supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

// 页面加载完成时初始化
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Initializing Supabase Auth...');
  
  // 绑定谷歌登录按钮
  const googleLoginBtn = document.getElementById('google-login-btn');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', handleGoogleLogin);
  }
  
  // 绑定登出按钮
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // 检查是否有会话，自动登录
  await checkAndRestoreSession();
  
  // 如果这是从OAuth重定向回来，处理会话
  await handleRedirectSession();
});

// 处理谷歌登录
async function handleGoogleLogin(e) {
  e.preventDefault();
  console.log('Starting Google login...');
  
  try {
    showLoading();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: SUPABASE_CONFIG.redirectUrl
      }
    });
    
    if (error) {
      throw error;
    }
    
    // 注意：此处不需要显示用户信息，因为会重定向到 Google
    console.log('Redirecting to Google login...');
  } catch (error) {
    console.error('Login failed:', error);
    showError('Login failed. Please try again.');
    hideLoading();
  }
}

// 检查并恢复会话
async function checkAndRestoreSession() {
  console.log('Checking for existing session...');
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Session error:', error);
    return;
  }
  
  if (session) {
    console.log('Found existing session');
    displayUserInfo(session.user);
    // 如果在登录页，登录成功后重定向到首页
    if (window.location.pathname.includes('register.html')) {
      window.location.href = 'index.html';
    }
  }
}

// 处理从OAuth重定向回来的会话
async function handleRedirectSession() {
  // 检查URL中是否有会话参数
  if (window.location.hash.includes('access_token') || 
      window.location.search.includes('code=')) {
    console.log('Processing OAuth redirect...');
    
    // 处理 OAuth 回调
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth error:', error);
      showError('Authentication failed. Please try again.');
      return;
    }
    
    if (session) {
      console.log('Successfully logged in after redirect');
      displayUserInfo(session.user);
      
      // 清除URL中的参数，以防止刷新时重复处理
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
      }
      
      // 登录成功后重定向到首页
      if (window.location.pathname.includes('register.html') || window.location.pathname.includes('auth/callback')) {
        window.location.href = '/index.html';
      }
    }
  }
}

// 显示用户信息
function displayUserInfo(user) {
  console.log('Displaying user info:', user);
  
  const userInfoContainer = document.getElementById('user-info');
  const googleLoginBtn = document.getElementById('google-login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (userInfoContainer) {
    userInfoContainer.innerHTML = `
      <p>Welcome, ${user.user_metadata.full_name || user.email}!</p>
      <p>Email: ${user.email}</p>
      ${user.user_metadata.avatar_url ? 
        `<img src="${user.user_metadata.avatar_url}" alt="Profile" style="width:80px;border-radius:50%;margin-top:10px;">` : 
        ''}
    `;
    userInfoContainer.style.display = 'block';
  }
  
  if (googleLoginBtn) googleLoginBtn.style.display = 'none';
  if (logoutBtn) logoutBtn.style.display = 'block';
  
  hideError();
  hideLoading();
}

// 处理登出
async function handleLogout() {
  console.log('Logging out...');
  
  try {
    showLoading();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    console.log('Successfully logged out');
    resetUI();
  } catch (error) {
    console.error('Logout error:', error);
    showError('Logout failed. Please try again.');
  } finally {
    hideLoading();
  }
}

// 重置 UI 到登出状态
function resetUI() {
  const userInfoContainer = document.getElementById('user-info');
  const googleLoginBtn = document.getElementById('google-login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (userInfoContainer) {
    userInfoContainer.innerHTML = '';
    userInfoContainer.style.display = 'none';
  }
  
  if (googleLoginBtn) googleLoginBtn.style.display = 'block';
  if (logoutBtn) logoutBtn.style.display = 'none';
  
  hideError();
}

// 显示错误消息
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

// 隐藏错误消息
function hideError() {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

// 显示加载指示器
function showLoading() {
  // 可以添加加载动画或改变按钮状态
  const googleLoginBtn = document.getElementById('google-login-btn');
  if (googleLoginBtn) {
    googleLoginBtn.disabled = true;
    googleLoginBtn.textContent = 'Loading...';
  }
}

// 隐藏加载指示器
function hideLoading() {
  // 恢复按钮状态
  const googleLoginBtn = document.getElementById('google-login-btn');
  if (googleLoginBtn) {
    googleLoginBtn.disabled = false;
    googleLoginBtn.innerHTML = `
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"/> 
      Continue with Google
    `;
  }
}