<?php
declare (strict_types = 1);

namespace app\controller;

use think\Request;
use think\facade\Filesystem;
use think\Response;

class Dreams
{
    private $apiKey = 'sk-5e355a7af3b842f1b646034657664a76';
    private $baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/generation';
    
    /**
     * 处理图片上传
     */
    public function uploadImage(Request $request)
    {
        try {
            // 1. 获取上传的文件
            $file = $request->file('file');
            if (!$file) {
                return json(['code' => 400, 'message' => '没有上传文件']);
            }

            // 2. 创建存储目录（按年月组织）
            $yearMonth = date('Y-m');
            $savePath = 'uploads/dreams/generated/' . $yearMonth;
            $publicPath = public_path() . $savePath;
            if (!is_dir($publicPath)) {
                mkdir($publicPath, 0755, true);
            }

            // 3. 验证文件
            validate(['file' => [
                'fileSize' => 20 * 1024 * 1024, // 20MB
                'fileExt' => ['jpg', 'jpeg', 'png', 'gif'],
                'fileMime' => ['image/jpeg', 'image/png', 'image/gif'],
            ]])->check(['file' => $file]);

            // 4. 保存文件
            $saveName = md5(uniqid()) . '.' . $file->getOriginalExtension();
            $file->move($publicPath, $saveName);

            // 5. 生成访问URL
            $url = request()->domain() . '/' . $savePath . '/' . $saveName;

            return json([
                'code' => 200,
                'message' => '上传成功',
                'url' => $url
            ]);

        } catch (\think\exception\ValidateException $e) {
            return json(['code' => 400, 'message' => $e->getMessage()]);
        } catch (\Exception $e) {
            return json(['code' => 500, 'message' => '上传失败：' . $e->getMessage()]);
        }
    }

    /**
     * 生成图片
     */
    public function generateImage(Request $request): Response
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $prompt = $data['prompt'] ?? '';
            if (empty($prompt)) {
                return json(['error' => '梦境描述不能为空']);
            }

            // 准备请求参数，按照阿里云文档格式
            $requestData = [
                'model' => 'flux-schnell',
                'input' => [
                    'prompt' => $prompt
                ],
                'parameters' => [
                    'size' => '768*512',
                    'n' => 1
                ]
            ];

            // 发送请求到阿里云 FLUX API
            $ch = curl_init($this->baseUrl);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json',
                'X-DashScope-Async: false'
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                $error = json_decode($response, true);
                throw new \Exception($error['message'] ?? '请求失败');
            }

            $result = json_decode($response, true);
            
            // 检查是否成功生成图片
            if (!isset($result['output']['results'][0]['url'])) {
                throw new \Exception('未获取到生成的图片URL');
            }

            return json([
                'error' => null,
                'imageUrl' => $result['output']['results'][0]['url']
            ]);
            
        } catch (\Exception $e) {
            return json([
                'error' => '生成图片失败',
                'message' => $e->getMessage()
            ], 500);
        }
    }
} 