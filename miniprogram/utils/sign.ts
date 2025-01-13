const API_KEY = 'sk-5e355a7af3b842f1b646034657664a76'

function getAuth() {
  return {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
}

module.exports = {
  getAuth
} 