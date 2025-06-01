import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
// import { getTokenFromServerSideCaller } from "~/pkg/helpers/server";

export async function loader(lfa: LoaderFunctionArgs) {
//   const token = await getTokenFromServerSideCaller(lfa);
  // replace with actual api callls 
  // this is placeholder data
  return { 
    products: [
      { id: 1, name: "Sample Product 1", price: 99.99 },
      { id: 2, name: "Sample Product 2", price: 149.99 },
      { id: 3, name: "Sample Product 3", price: 199.99 },
    ]
  };
}

export default function Products() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Products</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Add New Product
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-gray-700 mt-2">${product.price.toFixed(2)}</p>
            <div className="mt-4 flex justify-end">
              <Link 
                to={`/dashboard/product/${product.id}`}
                className="text-blue-600 hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}