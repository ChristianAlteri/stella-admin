import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserActions from "../../components/user-actions";
import prismadb from "@/lib/prismadb";
import { Progress } from "@/components/ui/progress";
import { cleanDecimals, currencyConvertor, formatter } from "@/lib/utils";
import {
  Archive,
  CreditCard,
  ShoppingCart,
  Package,
  Heart,
  MousePointer,
  Phone,
  MapPin,
  Users,
  Calendar,
  Layers,
  Grid,
  UserCircle,
} from "lucide-react";
import { User } from "@prisma/client";
import TopDesignersCard from "@/components/analytic-components/Cards/top-designers-card";
import TopCategoriesCard from "@/components/analytic-components/Cards/top-categories-card";

export default async function UserDetailsPage({
  params,
}: {
  params: { storeId: string; userId: string };
}) {
  const rawUser = await prismadb.user.findUnique({
    where: { id: params.userId },
    include: {
      orderHistory: {
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true,
                  designer: true,
                  subcategory: true,
                },
              },
            },
          },
        },
      },
      followingSeller: {
        include: {
          products: true,
        },
      },
      store: true,
      interactingStaff: true,
      likeList: true,
      clickList: true,
    },
  });

  const user = cleanDecimals(rawUser);
  const currencySymbol = currencyConvertor(user?.store?.countryCode || "GB");

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-4 h-full">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-start space-x-4">
            <UserInfo user={user} />
          </div>
          <UserActions data={user} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-row gap-4"></div>
        </CardContent>
      </Card>
      <CardHeader className="text-2xl font-bold flex w-full justify-center items-center text-center">
        Customer Analytics
      </CardHeader>
      <UserAnalytics user={user} currencySymbol={currencySymbol} />
    </div>
  );
}

function UserAnalytics({
  user,
  currencySymbol,
}: {
  user: any;
  currencySymbol: string;
}) {
  const totalPurchasesAmount = user.totalPurchases || 0;
  const averageOrderValue =
    user.totalPurchases && user.totalTransactionCount
      ? user.totalPurchases / user.totalTransactionCount
      : 0;

  // Calculate favorite designers
  const designerCounts = user.orderHistory
    .flatMap((order: { orderItems: any[] }) =>
      order.orderItems.map((item) => item.product.designer.name)
    )
    .reduce((acc: Record<string, number>, designer: string | number) => {
      acc[designer] = (acc[designer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const favoriteDesigners = (
    Object.entries(designerCounts) as [string, number][]
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)
    .join(", ");

  // Calculate favorite categories
  const categoryCounts = user.orderHistory
    .flatMap((order: { orderItems: any[] }) =>
      order.orderItems.map((item) => item.product.category.name)
    )
    .reduce((acc: { [x: string]: any }, category: string | number) => {
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

  const favoriteCategories = (
    Object.entries(categoryCounts) as [string, number][]
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)
    .join(", ");

  // Calculate favorite subcategories
  const subcategoryCounts = user.orderHistory
    .flatMap((order: { orderItems: any[] }) =>
      order.orderItems.map((item) => item.product.subcategory.name)
    )
    .reduce((acc: { [x: string]: any }, subcategory: string | number) => {
      acc[subcategory] = (acc[subcategory] || 0) + 1;
      return acc;
    }, {});

  const favoriteSubcategories = (
    Object.entries(subcategoryCounts) as [string, number][]
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)
    .join(", ");

  // Get last order date
  const lastOrderDate =
    user.orderHistory.length > 0
      ? new Date(
          Math.max(
            ...user.orderHistory.map(
              (order: { createdAt: string | number | Date }) =>
                new Date(order.createdAt).getTime()
            )
          )
        )
      : null;

  // Get interacting staff members
  const interactingStaffMembers = user.interactingStaff
    .map((staff: { name: any }) => staff.name)
    .join(", ");

  // Prepare data for TopDesignersCard and TopCategoriesCard
  const products = user.orderHistory.flatMap((order: { orderItems: any[] }) =>
    order.orderItems.map((item) => ({
      id: item.product.id,
      ourPrice: Number(item.product.ourPrice),
      isArchived: true,
      designer: item.product.designer,
      category: item.product.category,
    }))
  );

  return (
    <div className="grid gap-1 w-full space-y-4">
      {/* Top Designers and Top Categories Cards in two columns */}
      <div className="grid gap-4 grid-cols-2 w-full">
        <TopDesignersCard
          countryCode={user?.store?.countryCode || "GB"}
        />
        <TopCategoriesCard
          countryCode={user?.store?.countryCode || "GB"}
        />
      </div>

      {/* Analytics Cards in responsive grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        <AnalyticsCard
          title="Total Purchases"
          value={`${currencySymbol}${totalPurchasesAmount.toFixed(2)}`}
          icon={CreditCard}
        />
        <AnalyticsCard
          title="Total Items Purchased"
          value={user.totalItemsPurchased || 0}
          icon={Package}
        />
        <AnalyticsCard
          title="Total Transactions"
          value={user.totalTransactionCount || 0}
          icon={ShoppingCart}
        />
        <AnalyticsCard
          title="Average Order Value"
          value={`${currencySymbol}${averageOrderValue.toFixed(2)}`}
          icon={CreditCard}
        />
        <AnalyticsCard
          title="Liked Items"
          value={user.likeList.length || 0}
          icon={Heart}
        />
        <AnalyticsCard
          title="Clicked Items"
          value={user.clickList.length || 0}
          icon={MousePointer}
        />
        <AnalyticsCard
          title="Favorite Subcategories"
          value={favoriteSubcategories || "N/A"}
          icon={Grid}
        />
        <AnalyticsCard
          title="Last Order Date"
          value={lastOrderDate ? lastOrderDate.toLocaleDateString() : "N/A"}
          icon={Calendar}
        />
        <AnalyticsCard
          title="Interacting Staff"
          value={interactingStaffMembers || "N/A"}
          icon={UserCircle}
        />
      </div>
    </div>
  );
}

function AnalyticsCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function UserInfo({ user }: { user: User }) {
  return (
    <div>
      <CardTitle className="text-2xl font-bold">
        {user.name || "No Name Available"}
      </CardTitle>
      <p className="text-muted-foreground">
        {user.email || "No Email Provided"}
      </p>
      <div className="flex items-center text-muted-foreground text-sm">
        <Phone className="mr-2 h-4 w-4 text-muted-foreground text-sm" />
        <span>{user.phoneNumber || "No Phone Number Provided"}</span>
      </div>
      <div className="flex items-center text-muted-foreground text-sm">
        <MapPin className="mr-2 h-4 w-4 text-muted-foreground text-sm" />
        <span>{user.postalCode || "No Postal Code Provided"}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <UserBadge
          condition={!user.isArchived}
          icon={Archive}
          trueText="Active"
          falseText="Archived"
        />
      </div>
    </div>
  );
}

function UserBadge({
  condition,
  icon: Icon,
  trueText,
  falseText,
}: {
  condition: boolean;
  icon: React.ComponentType<{ className?: string }>;
  trueText: string;
  falseText: string;
}) {
  const baseClass = condition
    ? "bg-white border-black text-black"
    : "bg-gray-200 text-muted-foreground border-none";

  return (
    <Badge className={baseClass}>
      <Icon className="mr-1 h-3 w-3" />
      {condition ? trueText : falseText}
    </Badge>
  );
}

// import Image from "next/image";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import UserActions from "../../components/user-actions";
// import prismadb from "@/lib/prismadb";
// import { Progress } from "@/components/ui/progress";
// import { cleanDecimals, currencyConvertor, formatter } from "@/lib/utils";
// import {
//   Archive,
//   CreditCard,
//   ShoppingCart,
//   Package,
//   Heart,
//   MousePointer,
//   Phone,
//   MapPin,
//   Users,
//   Calendar,
//   Layers,
//   Grid,
//   UserCircle
// } from "lucide-react";
// import { User } from "@prisma/client";

// export default async function UserDetailsPage({
//   params,
// }: {
//   params: { storeId: string; userId: string };
// }) {
//   const rawUser = await prismadb.user.findUnique({
//     where: { id: params.userId },
//     include: {
//       orderHistory: {
//         include: {
//           orderItems: {
//             include: {
//               product: {
//                 include: {
//                   category: true,
//                   designer: true,
//                   subcategory: true,
//                 },
//               },
//             },
//           },
//         },
//       },
//       followingSeller: {
//         include: {
//           products: true,
//         },
//       },
//       store: true,
//       interactingStaff: true,
//       likeList: true,
//       clickList: true,
//     },
//   });

//   const user = cleanDecimals(rawUser);
//   const currencySymbol = currencyConvertor(user.store.countryCode || "GB");

//   console.log("user", user);

//   if (!user) {
//     return <div>User not found</div>;
//   }

//   return (
//     <div className="container mx-auto py-10">
//       <Card className="mb-4 h-full">
//         <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
//           <div className="flex items-start space-x-4">
//             <UserInfo user={user} />
//           </div>
//           <UserActions data={user} />
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-row gap-4">
//           </div>
//         </CardContent>
//       </Card>
//       <CardHeader className="text-2xl font-bold flex w-full justify-center items-center text-center">
//         Customer Analytics
//       </CardHeader>
//       <UserAnalytics user={user} currencySymbol={currencySymbol} />
//     </div>
//   );
// }

// function UserAnalytics({
//   user,
//   currencySymbol,
// }: {
//   user: any;
//   currencySymbol: string;
// }) {
//   const totalPurchasesAmount = user.totalPurchases || 0;
//   const averageOrderValue = user.totalPurchases && user.totalTransactionCount
//     ? user.totalPurchases / user.totalTransactionCount
//     : 0;

//   // Calculate favorite designers
//   const designerCounts = user.orderHistory.flatMap((order: { orderItems: any[]; }) =>
//     order.orderItems.map(item => item.product.designer.name)
//   ).reduce((acc: Record<string, number>, designer: string | number) => {
//     acc[designer] = (acc[designer] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

//   const favoriteDesigners = (Object.entries(designerCounts) as [string, number][])
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 3)
//     .map(([name]) => name)
//     .join(', ');

//   // Calculate favorite categories
//   const categoryCounts = user.orderHistory.flatMap((order: { orderItems: any[]; }) =>
//     order.orderItems.map(item => item.product.category.name)
//   ).reduce((acc: { [x: string]: any; }, category: string | number) => {
//     acc[category] = (acc[category] || 0) + 1;
//     return acc;
//   }, {});

//   const favoriteCategories = (Object.entries(categoryCounts) as [string, number][])
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 3)
//     .map(([name]) => name)
//     .join(', ');

//   // Calculate favorite subcategories
//   const subcategoryCounts = user.orderHistory.flatMap((order: { orderItems: any[]; }) =>
//     order.orderItems.map(item => item.product.subcategory.name)
//   ).reduce((acc: { [x: string]: any; }, subcategory: string | number) => {
//     acc[subcategory] = (acc[subcategory] || 0) + 1;
//     return acc;
//   }, {});

//   const favoriteSubcategories = (Object.entries(subcategoryCounts) as [string, number][])
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 3)
//     .map(([name]) => name)
//     .join(', ');

//   // Get last order date
//   const lastOrderDate = user.orderHistory.length > 0
//     ? new Date(Math.max(...user.orderHistory.map((order: { createdAt: string | number | Date; }) => new Date(order.createdAt).getTime())))
//     : null;

//   // Get interacting staff members
//   const interactingStaffMembers = user.interactingStaff
//     .map((staff: { name: any; }) => staff.name)
//     .join(', ');

//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//       <AnalyticsCard
//         title="Total Purchases"
//         value={`${currencySymbol}${totalPurchasesAmount.toFixed(2)}`}
//         icon={CreditCard}
//       />
//       <AnalyticsCard
//         title="Total Items Purchased"
//         value={user.totalItemsPurchased || 0}
//         icon={Package}
//       />
//       <AnalyticsCard
//         title="Total Transactions"
//         value={user.totalTransactionCount || 0}
//         icon={ShoppingCart}
//       />
//       <AnalyticsCard
//         title="Average Order Value"
//         value={`${currencySymbol}${averageOrderValue.toFixed(2)}`}
//         icon={CreditCard}
//       />
//       <AnalyticsCard
//         title="Liked Items"
//         value={user.likeList.length || 0}
//         icon={Heart}
//       />
//       <AnalyticsCard
//         title="Clicked Items"
//         value={user.clickList.length || 0}
//         icon={MousePointer}
//       />
//       <AnalyticsCard
//         title="Favorite Designers"
//         value={favoriteDesigners || "N/A"}
//         icon={Users}
//       />
//       <AnalyticsCard
//         title="Favorite Categories"
//         value={favoriteCategories || "N/A"}
//         icon={Layers}
//       />
//       <AnalyticsCard
//         title="Favorite Subcategories"
//         value={favoriteSubcategories || "N/A"}
//         icon={Grid}
//       />
//       <AnalyticsCard
//         title="Last Order Date"
//         value={lastOrderDate ? lastOrderDate.toLocaleDateString() : "N/A"}
//         icon={Calendar}
//       />
//       <AnalyticsCard
//         title="Interacting Staff"
//         value={interactingStaffMembers || "N/A"}
//         icon={UserCircle}
//       />
//     </div>
//   );
// }

// function AnalyticsCard({
//   title,
//   value,
//   icon: Icon,
// }: {
//   title: string;
//   value: string | number;
//   icon: React.ComponentType<{ className?: string }>;
// }) {
//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium">
//           {title}
//         </CardTitle>
//         <Icon className="h-4 w-4 text-muted-foreground" />
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold">{value}</div>
//       </CardContent>
//     </Card>
//   );
// }

// function UserInfo({ user }: { user: User }) {
//   return (
//     <div>
//       <CardTitle className="text-2xl font-bold">
//         {user.name || "No Name Available"}
//       </CardTitle>
//       <p className="text-muted-foreground">
//         {user.email || "No Email Provided"}
//       </p>
//       <div className="flex items-center text-muted-foreground text-sm">
//         <Phone className="mr-2 h-4 w-4 text-muted-foreground text-sm" />
//         <span>{user.phoneNumber || "No Phone Number Provided"}</span>
//       </div>
//       <div className="flex items-center text-muted-foreground text-sm">
//         <MapPin className="mr-2 h-4 w-4 text-muted-foreground text-sm" />
//         <span>{user.postalCode || "No Postal Code Provided"}</span>
//       </div>
//       <div className="flex flex-wrap gap-2 mt-2">
//         <UserBadge
//           condition={!user.isArchived}
//           icon={Archive}
//           trueText="Active"
//           falseText="Archived"
//         />
//       </div>
//     </div>
//   );
// }

// function UserBadge({
//   condition,
//   icon: Icon,
//   trueText,
//   falseText,
// }: {
//   condition: boolean;
//   icon: React.ComponentType<{ className?: string }>;
//   trueText: string;
//   falseText: string;
// }) {
//   const baseClass = condition
//     ? "bg-white border-black text-black"
//     : "bg-gray-200 text-muted-foreground border-none";

//   return (
//     <Badge className={baseClass}>
//       <Icon className="mr-1 h-3 w-3" />
//       {condition ? trueText : falseText}
//     </Badge>
//   );
// }
