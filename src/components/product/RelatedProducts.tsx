import { Badge } from '@/components/ui/Badge'
import { calcDiscountRate, formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import { Package, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface RelatedProductsProps {
    products: (Product & { category?: { name: string; slug: string } })[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
    if (products.length === 0) return null

    return (
        <section className="mt-16">
            <h2 className="text-xl font-bold text-navy-900 mb-6">
                함께 보면 좋은 상품
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => {
                    const discountRate = calcDiscountRate(product.original_price, product.sale_price)

                    return (
                        <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300"
                        >
                            <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        width={400}
                                        height={300}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                                        <Package className="w-6 h-6 text-primary-500" />
                                    </div>
                                )}
                                {discountRate > 0 && (
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="sale">{discountRate}%</Badge>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-primary-500 font-medium mb-1">
                                    {product.category?.name}
                                </p>
                                <h3 className="font-bold text-navy-900 text-sm mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                                    {product.name}
                                </h3>
                                <div className="flex items-end gap-1.5">
                                    <span className="text-lg font-black text-navy-900">
                                        {formatPrice(product.sale_price)}
                                    </span>
                                    {product.original_price > product.sale_price && (
                                        <span className="text-xs text-slate-400 line-through">
                                            {formatPrice(product.original_price)}
                                        </span>
                                    )}
                                </div>
                                {Number(product.review_avg) > 0 && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                        <Star className="w-3 h-3 fill-accent-400 text-accent-400" />
                                        {Number(product.review_avg).toFixed(1)}
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
