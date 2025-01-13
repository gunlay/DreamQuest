<?php
use think\facade\Route;

// 图片上传路由
Route::post('dreams/images/upload', 'Dreams/uploadImage')->allowCrossDomain();
// 生成图片路由
Route::post('dreams/generateImage', 'Dreams/generateImage')->allowCrossDomain(); 