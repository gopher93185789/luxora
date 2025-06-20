export default function SearchBar(){

    return (
        <div className="flex items-center justify-center w-full sticky top-5 z-10 ">
        <div className="relative w-full max-w-md">
            <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">
            Search
            </button>
        </div>
        </div>
    );
}