<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsMentor
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isMentor()) {
            return response()->json(['message' => 'Mentor access only'], 403);
        }

        return $next($request);
    }
}
