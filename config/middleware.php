<?php
return [
    // 别名或分组
    'alias'    => [],
    // 优先级设置，此数组中的中间件会按照数组中的顺序优先执行
    'priority' => [],
    // 跨域中间件配置
    'allow_cross_domain' => [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers' => 'Authorization,Content-Type,If-Match,If-Modified-Since,If-None-Match,If-Unmodified-Since,X-Requested-With',
    ],
]; 