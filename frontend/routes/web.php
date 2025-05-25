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

    return redirect('/dashboard.index')->with('success', 'Logged in successfully');
});

// New routes for interacting with the Luxora API as per swagger.yaml

// Healthcheck
Route::get('/api-ping', function () {
    $response = Http::get('https://api.luxoras.nl/ping');
    return $response->json() ?? $response->body();
});

// Auth Refresh Token
Route::post('/auth/token/refresh', function () {
    // Assuming the API expects the refresh token to be handled via HttpOnly cookie
    // or implicitly. If it needs to be sent, adjust accordingly.
    // The swagger for /auth/refresh does not specify request parameters.
    // If refresh token needs to be sent from session:
    // $refreshToken = Session::get('refresh_token');
    // $response = Http::post('https://api.luxoras.nl/auth/refresh', ['refresh_token' => $refreshToken]);

    $response = Http::post('https://api.luxoras.nl/auth/refresh'); // Simplified call

    if ($response->ok()) {
        $data = $response->json();
        Session::put('access_token', $data['access_token']);
        // Potentially update refresh token if a new one is issued
        return response()->json($data);
    }
    return response()->json(['error' => 'Failed to refresh token', 'details' => $response->json()], $response->status());
});

// Listings
Route::prefix('/ui/listings')->middleware('auth.session')->group(function () { // Assuming a middleware to check session
    // Get product listings
    Route::get('/', function (\Illuminate\Http\Request $request) {
        $response = Http::withToken(Session::get('access_token'))
            ->get('https://api.luxoras.nl/listings', $request->query());
        return $response->json() ?? response()->json(['error' => 'Failed to fetch listings'], $response->status());
    });

    // Create new listing
    Route::post('/', function (\Illuminate\Http\Request $request) {
        $response = Http::withToken(Session::get('access_token'))
            ->post('https://api.luxoras.nl/listings', $request->all());
        return $response->json() ?? response()->json(['error' => 'Failed to create listing'], $response->status());
    });

    // Delete a listing
    // Note: Swagger specifies DELETE /listings/ with 'id' as a query parameter.
    Route::delete('/delete/{id}', function ($id) {
        $response = Http::withToken(Session::get('access_token'))
            ->delete('https://api.luxoras.nl/listings/', ['id' => $id]);
        return $response->json() ?? response()->json(['error' => 'Failed to delete listing', 'id' => $id], $response->status());
    });

    // Create a bid
    Route::post('/bid', function (\Illuminate\Http\Request $request) {
        $response = Http::withToken(Session::get('access_token'))
            ->post('https://api.luxoras.nl/listings/bid', $request->all());
        return $response->json() ?? response()->json(['error' => 'Failed to create bid'], $response->status());
    });

    // Get bids for a product listing
    Route::get('/products/{productId}/bids', function ($productId, \Illuminate\Http\Request $request) {
        $queryParams = array_merge($request->query(), ['productid' => $productId]);
        $response = Http::withToken(Session::get('access_token'))
            ->get('https://api.luxoras.nl/listings/bids', $queryParams);
        return $response->json() ?? response()->json(['error' => 'Failed to fetch bids'], $response->status());
    });

    // Checkout cart
    Route::post('/checkout', function (\Illuminate\Http\Request $request) {
        $response = Http::withToken(Session::get('access_token'))
            ->post('https://api.luxoras.nl/listings/checkout', $request->all());
        return $response->json() ?? response()->json(['error' => 'Checkout failed'], $response->status());
    });

    // Get highest bid for a product
    Route::get('/products/{productId}/highest-bid', function ($productId) {
        $response = Http::withToken(Session::get('access_token'))
            ->get('https://api.luxoras.nl/listings/highest-bid', ['productid' => $productId]);
        return $response->json() ?? response()->json(['error' => 'Failed to fetch highest bid'], $response->status());
    });

    // Update sold status via bid
    Route::put('/sell-via-bid', function (\Illuminate\Http\Request $request) {
        $response = Http::withToken(Session::get('access_token'))
            ->put('https://api.luxoras.nl/listings/sold/bid', $request->all());
        return $response->json() ?? response()->json(['error' => 'Failed to update sold status'], $response->status());
    });
});

// It's good practice to define a middleware (e.g., 'auth.session')
// to protect routes that require an authenticated user session.
// For example, in app/Http/Kernel.php:
// protected $routeMiddleware = [
//     // ... other middleware
//     'auth.session' => \App\Http\Middleware\EnsureUserIsAuthenticated::class, // Create this middleware
// ];
// And the EnsureUserIsAuthenticated middleware would check Session::has('access_token')
// and redirect to login if not present.
// This part is a suggestion and not directly added by this tool.

