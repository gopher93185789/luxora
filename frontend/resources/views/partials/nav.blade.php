<nav class= "bg-black sticky top-0 z-10" x-data="{ open: false }">
    <div class="container mx-auto px-4 py-4 flex flex-row items-center justify-between">
            <button @click="open = !open"
            class="focus:outline-none z-50 relative"
            :aria-expanded="open.toString()"
            aria-controls="mobile-menu">
            <svg x-show="!open" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <svg x-show="open" x-cloak class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"/>
            </svg>  
            </button>

                <a href="/" class="text-2xl z-50 font-extrabold text-white">Luxora</a>

            <button class="flex flex-col p-4 pt-1 pb-1 bg-white rounded gap-7" >
                <a href="{{ route('login') }}" class=" text-black text-sm hover:text-black">Login</a>
            </buton>
    </div>

    <div x-show="open"
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0 -translate-x-6"
         x-transition:enter-end="opacity-100 translate-x-0"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100 translate-x-0"
         x-transition:leave-end="opacity-0 -translate-x-6"
         class="fixed top-0 left-0 w-full h-screen bg-black z-40 flex flex-row p-56 gap-10 ">
         <div class="flex flex-col gap-12 w-72" >
             <a href="{{ route('products.index') }}" class="block text-gray-200 text-7xl hover:text-white">Products</a>
             <a href="{{ route('about') }}" class="block text-gray-200 text-7xl hover:text-white">About</a>
             <a href="{{ route('contact') }}" class="block text-gray-200 text-7xl hover:text-white">Contact</a>
     
             @auth
                 <a href="{{ route('profile') }}" class="block text-gray-200 text-7xl hover:text-white">Dashboard</a>
                 <form method="POST" action="{{ route('logout') }}">
                     @csrf
                     <button type="submit" class="block w-full text-left text-gray-200 text-5xl hover:text-white">Logout</button>
                 </form>
             @else
             @endauth
         </div>
         @include('partials.slider')

    </div>
</nav>
