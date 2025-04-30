 const { OAuth2Client } = require('google-auth-library');

// 初始化 Google OAuth2 客户端
const client = new OAuth2Client('301486741518-pcsrdrp9jl5p67vah5n5ht7aa8no1nv6.apps.googleusercontent.com');

/**
 * 验证 Google 令牌并返回用户信息
 * @param {string} token - Google ID 令牌
 * @returns {Promise<Object>} 用户信息
 */
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '301486741518-pcsrdrp9jl5p67vah5n5ht7aa8no1nv6.apps.googleusercontent.com'
    });
    
    const payload = ticket.getPayload();
    return {
      success: true,
      user: {
        userId: payload['sub'],
        email: payload['email'],
        name: payload['name'],
        picture: payload['picture'],
        emailVerified: payload['email_verified']
      }
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return {
      success: false,
      error: 'Invalid token'
    };
  }
}

/**
 * API 路由处理函数
 */
module.exports = async (req, res) => {
  // 启用 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理 OPTIONS 请求（预检请求）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const result = await verifyGoogleToken(token);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
