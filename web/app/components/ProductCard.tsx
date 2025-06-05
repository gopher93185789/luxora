
import { useProductInfo } from "~/hooks/use-product-info"

interface ProductCardProps {
    product: {
        name: string;
        description: string;
        price: number;
        category: string;
        startprice?: string;
        endprice?: string;
        searchquery?: string;
        creator?: string;
    };
}

export default function ProductCard({ product }: ProductCardProps) {

    const { products, error, loading, refetch } = useProductInfo({
        limit: 10,
        page: 1,
        category: product.category,
        startprice: product.startprice,
        endprice: product.endprice,
        searchquery: product.searchquery,
        creator: product.creator
    });


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!products || products.length === 0) return <div>No products found.</div>;

    return (
        <div className="product-card">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Price: {product.price} EUR</p>
            <p>Category: {product.category}</p>
            <button onClick={() => refetch()}>Refresh Products</button>
        </div>
    )
}


