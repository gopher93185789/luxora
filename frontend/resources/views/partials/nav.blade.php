<nav class="bg-white  relative z-10" x-data="{ open: false }">
    <div class="container mx-auto px-4 py-4 flex flex-row-reverse items-center justify-between">

        
            <button @click="open = !open"
            class="focus:outline-none z-50 relative"
            :aria-expanded="open.toString()"
            aria-controls="mobile-menu">
            <svg x-show="!open" class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <svg x-show="open" x-cloak class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"/>
            </svg>  
            </button>
        <a href="/" class="text-2xl z-50 font-bold text-gray-800">Luxora</a>
        <div></div>
    </div>

    <div x-show="open"
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0 -translate-y-6"
         x-transition:enter-end="opacity-100 translate-y-0"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100 translate-y-0"
         x-transition:leave-end="opacity-0 -translate-y-6"
         class="absolute top-0 left-0 w-full h-screen bg-white z-40 flex flex-col p-56 gap-10">
         <a href="{{ route('products.index') }}" class="block text-gray-700 text-7xl hover:text-black">Products</a>
        <a href="{{ route('about') }}" class="block text-gray-700 text-7xl hover:text-black">About</a>
        <a href="{{ route('contact') }}" class="block text-gray-700 text-7xl hover:text-black">Contact</a>

        @auth
            <a href="{{ route('profile') }}" class="block text-gray-700 text-7xl hover:text-black">Dashboard</a>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="block w-full text-left text-gray-700 text-5xl hover:text-black">Logout</button>
            </form>
        @else
        <div class="flex flex-col p-7 bg-gray-300 rounded w-3xs gap-7" >
            <a href="{{ route('login') }}" class="block text-gray-700 text-4xl hover:text-black">Login</a>
            <a href="{{ route('register') }}" class="block text-gray-700 text-4xl hover:text-black">Register</a>
        </div>
        @endauth
    </div>
</nav>
