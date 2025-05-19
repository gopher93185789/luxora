<?php

use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\LandingController;

Route::get('/', [LandingController::class, 'index']);

Route::get('/products', [App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
Route::get('/login', [App\Http\Controllers\LoginController::class, 'login'])->name('login');
Route::view('/dashboard', 'dashboard.index')->name('dashboard.index');

Route::view('/about', 'about')->name('about');

Route::view('/contact', 'contact')->name('contact');

Route::get('/auth/{provider}', function ($provider) {
    $validProviders = ['google', 'github'];

    if (!in_array($provider, $validProviders)) {
        abort(404);
    }

    return redirect("https://api.luxoras.nl/auth/{$provider}");
})->name('auth.redirect');


Route::get('/auth/callback', function (\Illuminate\Http\Request $request) {
    $code = $request->query('code');
    $provider = $request->query('provider', 'github');
    if (!$code) {
        abort(400, 'Missing code');
    }

    $response = Http::post("https://api.luxoras.nl/auth/{$provider}/exchange", [
        'code' => $code,
        'redirect_uri' => url('/auth/callback'),
    ]);

    if (!$response->ok()) {
        abort(500, 'Token exchange failed');
    }

    $data = $response->json();

  

    Session::put('user', $data['user']);
    Session::put('access_token', $data['access_token']);
    Session::put('refresh_token', $data['refresh_token'] ?? null);

    return redirect('/dashboard.index');
});

