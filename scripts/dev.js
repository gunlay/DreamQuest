/* eslint-disable import/no-commonjs */
const { prompt } = require('inquirer');
const { spawn } = require('child_process');

const platforms = [
  { name: '微信小程序 (WeApp)', value: 'weapp' },
  { name: '字节跳动小程序 (TT)', value: 'tt' },
  { name: 'H5网页', value: 'h5' }
];

async function selectPlatform() {
  const { platform } = await prompt([
    {
      type: 'list',
      name: 'platform',
      message: '请选择要启动的平台：',
      choices: platforms
    }
  ]);
  return platform;
}

async function startDev() {
  try {
    const platform = await selectPlatform();
    console.log(`正在启动 ${platform} 开发服务...`);
    
    const child = spawn('pnpm', ['run', `dev:${platform}`], {
      stdio: 'inherit',
      shell: true
    });

    child.on('error', (error) => {
      console.error(`启动失败: ${error.message}`);
      process.exit(1);
    });

  } catch (error) {
    console.error(`发生错误: ${error.message}`);
    process.exit(1);
  }
}

startDev();