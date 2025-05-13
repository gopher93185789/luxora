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
               <div class="showcase  grid grid-cols-3 gap-2" >
            <x-product-card />
        </div>
    </body>
</html>
