import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductActions from "../../components/product-cell-action";
import { ProductColumn } from "../../components/columns";
import prismadb from "@/lib/prismadb";
import { Progress } from "@/components/ui/progress";
import { formatter } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import {
  Archive,
  EyeOff,
  Gift,
  Heart,
  Layers,
  MousePointer,
  Palette,
  Percent,
  Ruler,
  Shirt,
  Star,
  Tag,
  Users,
  ShoppingBag,
} from "lucide-react";

export default async function ProductDetailsPage({
  params,
}: {
  params: { storeId: string; productId: string };
}) {
  const product = await prismadb.product.findUnique({
    where: { id: params.productId },
    include: {
      designer: true,
      store: true,
      seller: true,
      category: true,
      condition: true,
      color: true,
      material: true,
      size: true,
      subcategory: true,
      gender: true,
      images: true,
    },
  });

  if (!product) {
    return <div>Product not found</div>;
  }

  const productColumnData: ProductColumn = {
    id: product.id,
    name: product.name,
    description: product.description || "",
    ourPrice: formatter.format(product.ourPrice.toNumber()),
    retailPrice: formatter.format(product.retailPrice.toNumber()),
    designer: product.designer.name,
    category: product.category.name,
    sellerHandle: product.seller.instagramHandle,
    size: product.size.name,
    color: product.color.name,
    condition: product.condition.name,
    gender: product.gender.name,
    subcategory: product.subcategory.name,
    createdAt: product.createdAt.toISOString(),
    isFeatured: product.isFeatured,
    isArchived: product.isArchived,
    isOnSale: product.isOnSale,
    isCharity: product.isCharity,
    isHidden: product.isHidden,
    material: product.material?.name,
    likes: product.likes,
    clicks: product.clicks,
    imageUrl: product.images[0]?.url || "",
    designerId: product.designerId,
    categoryId: product.categoryId,
    storeId: product.storeId,
    sellerId: product.sellerId,
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8 h-full">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-start space-x-4">
            <ProductImage product={product} />
            <ProductInfo product={product} />
          </div>
          {/* <CellAction data={productColumnData} /> */}
          <ProductActions data={productColumnData} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-row gap-4">
            <div className="flex flex-row w-full">
              <PriceInfo product={product} params={params} />
              <ProductDetails product={product} />
            </div>
          </div>
        </CardContent>
      </Card>
      <ProductAnalytics product={product} />
    </div>
  );
}

function ProductAnalytics({ product }: { product: any }) {
  const ctr = product.clicks > 0 ? (product.likes / product.clicks) * 100 : 0;
  const daysListed = differenceInDays(new Date(), new Date(product.createdAt));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagement</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{product.likes} likes</div>
          <div className="text-xs text-muted-foreground">
            {product.clicks} clicks
          </div>
          <Progress value={ctr} className="mt-2" />
          <div className="text-xs text-muted-foreground mt-1">
            CTR: {ctr.toFixed(2)}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Listing Duration
          </CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{daysListed} days</div>
          <div className="text-xs text-muted-foreground">
            Listed on{" "}
            {new Date(product.createdAt).toLocaleDateString('en-GB')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductImage({ product }: { product: any }) {
  const isVideo = product.images[0]?.url.match(
    /https:\/\/.*\.(video|mp4|MP4|mov).*/
  );

  return (
    <div className="relative h-32 w-32">
      {isVideo ? (
        <video
          src={product.images[0].url}
          className="rounded-md object-cover"
          loop
          muted
          autoPlay
          playsInline
        />
      ) : (
        <Image
          src={product.images[0]?.url || "/placeholder.png"}
          alt={product.name}
          className="rounded-md object-cover"
          width={128}
          height={128}
        />
      )}
    </div>
  );
}

function ProductInfo({ product }: { product: any }) {
  return (
    <div>
      <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
      <p className="text-muted-foreground">{product.designer.name}</p>
      <div className="flex items-center">
        <Tag className="mr-2 h-4 w-4" />
        <span>{product.category.name}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <ProductBadge
          condition={!product.isArchived}
          icon={Archive}
          trueText="Live"
          falseText="Sold"
        />
        <ProductBadge
          condition={product.isOnSale}
          icon={Percent}
          trueText="On Sale"
          falseText="Not on Sale"
        />
        <ProductBadge
          condition={product.isCharity}
          icon={Gift}
          trueText="Charity"
          falseText="Not for Charity"
        />
        <ProductBadge
          condition={product.isHidden}
          icon={EyeOff}
          trueText="Hidden"
          falseText="Visible"
          invertColors
        />
        <ProductBadge
          condition={product.isFeatured}
          icon={Star}
          trueText="Featured"
          falseText="Not Featured"
        />
      </div>
    </div>
  );
}

function ProductBadge({
  condition,
  icon: Icon,
  trueText,
  falseText,
  invertColors = false,
}: {
  condition: boolean;
  icon: React.ComponentType<{ className?: string }>;
  trueText: string;
  falseText: string;
  invertColors?: boolean;
}) {
  const baseClass =
    condition !== invertColors
      ? "bg-white border-black text-black"
      : "bg-gray-200 text-muted-foreground border-none";

  return (
    <Badge className={baseClass}>
      <Icon className="mr-1 h-3 w-3" />
      {condition ? trueText : falseText}
    </Badge>
  );
}

function PriceInfo({
  product,
  params,
}: {
  product: any;
  params: { storeId: string; productId: string };
}) {
  return (
    <div className="space-y-2 w-1/2 mt-3">
      <div className="flex items-center">
        <Tag className="mr-2 h-4 w-4" />
        <span>{product.category.name}</span>
      </div>
      <div className="flex items-center">
        <span>{formatter.format(product.ourPrice.toNumber())}</span>
      </div>
      <div className="flex items-center">
        <span>RRP: {formatter.format(product.retailPrice.toNumber())}</span>
      </div>
      <a
        href={`/${params.storeId}/sellers/${product?.sellerId}/details`}
        className="flex items-center hover:underline hover:cursor-pointer"
      >
        <span>{product.seller.instagramHandle}</span>
      </a>
    </div>
  );
}

function ProductDetails({ product }: { product: any }) {
  const details = [
    { icon: Heart, label: "likes", value: product.likes || 0 },
    { icon: MousePointer, label: "clicks", value: product.clicks || 0 },
    { icon: Palette, label: "Color", value: product.color.name },
    { icon: Ruler, label: "Size", value: product.size.name },
    { icon: Shirt, label: "Material", value: product.material?.name || "N/A" },
    { icon: Users, label: "Gender", value: product.gender.name },
    { icon: Layers, label: "Subcategory", value: product.subcategory.name },
  ];

  return (
    <div>
      <CardContent className="flex flex-row gap-2 items-end">
        <div className="flex flex-row gap-8 justify-end w-full items-end">
          {details.map((detail, index) => (
            <div key={index} className="flex items-center space-x-2">
              <detail.icon className="h-4 w-4" />
              <span>{`${detail.value}`}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
