<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use Illuminate\Http\Request;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\LoginController;


/*
|--------------------------------------------------------------------------
| public routes
|--------------------------------------------------------------------------
*/

Route::get('/', [LandingController::class, 'index']);
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/login', [LoginController::class, 'login'])->name('login');

Route::view('/dashboard', 'dashboard.index')->name('dashboard.index');
Route::view('/about', 'about')->name('about');
Route::view('/contact', 'contact')->name('contact');

/*
|--------------------------------------------------------------------------
| authantication (OAuth)
|--------------------------------------------------------------------------
*/

Route::get('/auth/{provider}', function ($provider) {
    $validProviders = ['google', 'github'];

    abort_unless(in_array($provider, $validProviders), 404);

    return redirect("https://api.luxoras.nl/auth/{$provider}");
})->name('auth.redirect');

Route::get('/auth/callback', function (Request $request) {
    $code = $request->query('code');
    $provider = $request->query('provider', 'github');

    abort_if(!$code, 400, 'Missing code');

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

    return redirect()->route('dashboard.index')->with('success', 'Logged in successfully');
});

Route::post('/auth/token/refresh', function () {
    $response = Http::post('https://api.luxoras.nl/auth/refresh');

    if ($response->ok()) {
        $data = $response->json();
        Session::put('access_token', $data['access_token']);
        return response()->json($data);
    }

    return response()->json([
        'error' => 'Failed to refresh token',
        'details' => $response->json(),
    ], $response->status());
});

/*
|--------------------------------------------------------------------------
| authanticated routes: listings
|--------------------------------------------------------------------------
*/

Route::prefix('/ui/listings')->middleware('auth.session')->group(function () {

    Route::get('/', function (Request $request) {
        $response = Http::withToken(Session::get('access_token'))
            ->get('https://api.luxoras.nl/listings', $request->query());

        return $response->json() ?? response()->json(['error' => 'Failed to fetch listings'], $response->status());
    });

    Route::post('/', function (Request $request) {
        $response = Http::withToken(Session::get('access_token'))
            ->post('https://api.luxoras.nl/listings', $request->all());

        return $response->json() ?? response()->json(['error' => 'Failed to create listing'], $response->status());
    });

    Route::delete('/delete/{id}', function ($id) {
        $response = Http::withToken(Session::get('access_token'))
            ->delete('https://api.luxoras.nl/listings/', ['id' => $id]);

        return $response->json() ?? response()->json(['error' => 'Failed to delete listing'], $response->status());
    });

    Route::post('/bid', function (Request $request) {
        $response = Http::withToken(Session::get('access_token'))
            ->post('https://api.luxoras.nl/listings/bid', $request->all());

        return $response->json() ?? response()->json(['error' => 'Failed to create bid'], $response->status());
    });

    Route::get('/products/{productId}/bids', function ($productId, Request $request) {
        $queryParams = array_merge($request->query(), ['productid' => $productId]);

        $response = Http::withToken(Session::get('access_token'))
            ->get('https://api.luxoras.nl/listings/bids', $queryParams);

        return $response->json() ?? response()->json(['error' => 'Failed to fetch bids'], $response->status());
    });

    Route::post('/checkout', function (Request $request) {
        $response = Http::withToken(Session::get('access_token'))
            ->post('https://api.luxoras.nl/listings/checkout', $request->all());

        return $response->json() ?? response()->json(['error' => 'Checkout failed'], $response->status());
    });

    Route::get('/products/{productId}/highest-bid', function ($productId) {
        $response = Http::withToken(Session::get('access_token'))
            ->get('https://api.luxoras.nl/listings/highest-bid', ['productid' => $productId]);

        return $response->json() ?? response()->json(['error' => 'Failed to fetch highest bid'], $response->status());
    });

    Route::put('/sell-via-bid', function (Request $request) {
        $response = Http::withToken(Session::get('access_token'))
            ->put('https://api.luxoras.nl/listings/sold/bid', $request->all());

        return $response->json() ?? response()->json(['error' => 'Failed to update sold status'], $response->status());
    });
});
