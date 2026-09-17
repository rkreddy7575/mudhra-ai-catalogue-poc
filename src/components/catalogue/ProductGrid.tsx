import ProductCard from './ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import type { Product } from '@/types';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export default function ProductGrid({ products, emptyMessage }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Search size={28} />}
        title="No products found"
        description={emptyMessage || 'Try adjusting your search or browse a different category.'}
        action={
          <Link href="/catalogue">
            <Button variant="secondary" size="sm">
              Browse All
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 stagger-children">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
