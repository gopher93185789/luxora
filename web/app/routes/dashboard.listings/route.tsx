import ProductCard from "~/components/ProductCard";



export default function Listings() {
  return (
      <main>
        <div>
          <ProductCard product={
            {
              name: "Sample Product",
              description: "This is a sample product description.",
              price: 100,
              category: "Electronics",
              startprice: "50",
              endprice: "150",
              searchquery: "sample",
              creator: "user123"
            }
          } />
        </div>
      </main>
  )
}