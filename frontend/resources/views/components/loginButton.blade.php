
<div class="flex flex-col items-center justify-center h-screen space-y-6 gap-2">
    <h1 class="text-3xl font-bold">Log in to Luxora</h1>

    <a href="{{ route('auth.redirect', ['provider' => 'google']) }}"
       class="px-6 py-2 bg-red-500 text-black rounded bg-white transition">
        Google
    </a>

    <a href="{{ route('auth.redirect', ['provider' => 'github']) }}"
       class="px-6 py-2 bg-gray-800 text-black rounded bg-white transition">
        GitHub
    </a>
</div>
