<div class="bg-white rounded shadow-md overflow-hidden">
    @if ($image)
        <img src="{{ $image }}" alt="{{ $title }}" class="w-full h-56 object-cover">
    @else
        <div class="w-full h-56 bg-gray-300"></div>
    @endif

    <div class="p-6">
        <h3 class="text-xl font-semibold text-gray-800">{{ $title ?? 'Product Title' }}</h3>
        <p class="text-gray-600 text-sm mt-2 line-clamp-3">
            {{ $description ?? 'Short description goes here.' }}
        </p>

        <a href="{{ $link ?? '#' }}"
           class="mt-4 inline-block text-sm text-white bg-black px-4 py-2 rounded hover:bg-gray-800">
            View Details
        </a>
    </div>
</div>
