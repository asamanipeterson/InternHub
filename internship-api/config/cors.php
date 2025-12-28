<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],

    'allowed_methods' => ['*'],

    // We allow both localhost and 127.0.0.1 to be safe
    'allowed_origins' => ['http://localhost:8080', 'http://127.0.0.1:8080'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // This MUST be true for Sanctum/Cookies to work
    'supports_credentials' => true,
];
