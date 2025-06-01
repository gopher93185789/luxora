import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
// import { getTokenFromServerSideCaller } from "~/pkg/helpers/server";

export async function loader({ params }: LoaderFunctionArgs) {
  const productId = params.id;
  // laod the actual product data from our api
  // is is just placeholder data
  return {
    product: {
      id: productId,
      name: `Product ${productId}`,
      description: `This is the detailed description for product ${productId}. It contains all the information a buyer would need to know about the product.`,
      price: 99.99 + (Number(productId) * 50),
      images: [`https://placehold.co/600x400?text=Product+${productId}`],
      specs: {
        dimensions: "10 x 5 x 3 inches",
        weight: "2 lbs",
        material: "Premium quality"
      }
    }
  };
}

export default function ProductDetail() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 mb-4">
        <Link to="/dashboard/products" className="text-blue-600 hover:underline">
          Products
        </Link>
        <span className="text-gray-500">/</span>
        <span>{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full rounded-lg shadow-md" 
          />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl text-blue-600 mt-2">${product.price.toFixed(2)}</p>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Product Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Specifications</h2>
            <ul className="text-gray-700">
              <li><strong>Dimensions:</strong> {product.specs.dimensions}</li>
              <li><strong>Weight:</strong> {product.specs.weight}</li>
              <li><strong>Material:</strong> {product.specs.material}</li>
            </ul>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
              Edit Product
            </button>
            <button className="border border-red-600 text-red-600 hover:bg-red-50 px-6 py-2 rounded">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
