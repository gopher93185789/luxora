<div x-data="{ currentSlide: 0, slides: [ 
    '/images/image1.webp', 
    '/images/image3.jpg', 
    '/images/image4.png' 
] }" class="relative w-full max-w-4xl mx-auto overflow-hidden rounded">

    <template x-for="(slide, index) in slides" :key="index">
        <div
            x-show="currentSlide === index"
            x-transition
            class="w-full h-auto sm:h-96 bg-center bg-cover hover:scale-105 duration-300"
            :style="'background-image: url(' + slide + ')'"
        ></div>
    </template>

    <button @click="currentSlide = (currentSlide === 0) ? slides.length - 1 : currentSlide - 1"
        class="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-80 text-black p-2 rounded-full">
        
    </button>

    <button @click="currentSlide = (currentSlide === slides.length - 1) ? 0 : currentSlide + 1"
        class="absolute right-2 top-1/2 flex justify-center items-center -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-80 text-black p-2 rounded-full">
        
    </button>

</div>
