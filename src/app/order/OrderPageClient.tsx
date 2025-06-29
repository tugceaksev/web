type Product = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

export default function OrderForm({ products }: { products: Product[] }) {
  const total = products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {products.map((product) => (
        <div key={product.id} className="border-b pb-4">
          <p className="text-lg font-semibold">{product.name}</p>
          <p className="text-sm text-gray-600">Adet: {product.quantity}</p>
          <p className="text-sm text-gray-600">Fiyat: {product.price.toFixed(2)} ₺</p>
        </div>
      ))}

      <div className="mt-6">
        <p className="text-xl font-bold">Toplam: {total.toFixed(2)} ₺</p>
      </div>
    </div>
  );
}
