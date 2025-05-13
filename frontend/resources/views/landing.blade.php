<!DOCTYPE html>
<html lang="en">
<head>
    <title>Home</title>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://unpkg.com/aos@next/dist/aos.css" rel="stylesheet" />
    @vite('resources/css/app.css')
</head>
<script src="https://unpkg.com/aos@next/dist/aos.js"></script>
<script>
    AOS.init();
</script>
    <body>
        @include('partials.nav')

        <div class="main flex flex-col justify- w-screen h-full text-center px-4">
        <p class="slogan text-xl sm:text-2xl md:text-4xl lg:text-2xl text-white text-shadow-white mt-24">
                Rule Your World —
            </p>
            <div
            class="transition-all duration-1000 ease-in-out h-screen">
                <p class="title text-5xl font-extrabold sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[13rem] text-white leading-tight">
                    Luxora
                </p>
            </div>
        </div>
        <div class="showcase  grid grid-cols-3 gap-2" >
            <x-product-card />
            <x-product-card />
            <x-product-card />
            <x-product-card />
            <x-product-card />
            <x-product-card />
            <x-product-card />
            <x-product-card />
            <x-product-card />
        </div>
    </body>
</html>
