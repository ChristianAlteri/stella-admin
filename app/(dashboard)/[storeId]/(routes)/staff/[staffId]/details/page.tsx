import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StaffActions from "../../components/staff-actions";
import prismadb from "@/lib/prismadb";
import { Progress } from "@/components/ui/progress";
import { currencyConvertor, formatter } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import {
  Archive,
  DollarSign,
  ShoppingCart,
  Users,
  Repeat,
  Target,
} from "lucide-react";
import { Staff } from "@prisma/client";
import { TbClipboardData, TbLego } from "react-icons/tb";
import Decimal from "decimal.js";

function cleanDecimals(object: any) {
  return JSON.parse(
    JSON.stringify(object, (key, value) =>
      value instanceof Decimal ? value.toNumber() : value
    )
  );
}

export default async function StaffDetailsPage({ params }: { params: { storeId: string; staffId: string } }) {
  const rawStaff = await prismadb.staff.findUnique({
    where: { id: params.staffId },
    include: {
      store: true,
      orders: true,
      orderItems: true,
      customers: true,
    },
  });

  const staff = cleanDecimals(rawStaff);
  const currencySymbol = currencyConvertor(staff?.store?.countryCode || "GB");

  if (!staff) {
    return <div>Staff member not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-4 h-full">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-start space-x-4">
            <StaffInfo staff={staff} />
          </div>
          <StaffActions data={staff} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-row gap-4">
            {/* <div className="flex flex-row w-full">
              <StaffDetails staff={staff} currencySymbol={currencySymbol} />
            </div> */}
          </div>
        </CardContent>
      </Card>
      <CardHeader className="text-2xl font-bold flex w-full justify-center items-center text-center">Monthly KPI&apos;s</CardHeader>
      <StaffAnalytics staff={staff} currencySymbol={currencySymbol} />
    </div>
  );
}

function StaffAnalytics({ staff, currencySymbol }: { staff: any, currencySymbol: string }) {
  const salesProgress = staff.totalSales && staff.targetTotalSales
    ? (staff.totalSales / staff.targetTotalSales) * 100
    : 0;
  const transactionProgress = staff.totalTransactionCount && staff.targetTotalTransactionCount
    ? (staff.totalTransactionCount / staff.targetTotalTransactionCount) * 100
    : 0;
  const itemsSoldProgress = staff.totalItemsSold && staff.targetTotalItemsSold
    ? (staff.totalItemsSold / staff.targetTotalItemsSold) * 100
    : 0;
  const returningCustomersProgress = staff.returningCustomers && staff.targetReturningCustomers
    ? (staff.returningCustomers / staff.targetReturningCustomers) * 100
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AnalyticsCard
        title="Total Sales"
        value={`${currencySymbol}${staff.totalSales || 0}`}
        icon={TbClipboardData}
        progress={salesProgress}
        target={`${currencySymbol}${staff.targetTotalSales || 0}`}
      />
      <AnalyticsCard
        title="Total Transactions"
        value={staff.totalTransactionCount || 0}
        icon={ShoppingCart}
        progress={transactionProgress}
        target={staff.targetTotalTransactionCount || 0}
      />
      <AnalyticsCard
        title="Total Items Sold"
        value={staff.totalItemsSold || 0}
        icon={Archive}
        progress={itemsSoldProgress}
        target={staff.targetTotalItemsSold || 0}
      />
      <AnalyticsCard
        title="Returning Customers"
        value={staff.returningCustomers || 0}
        icon={Repeat}
        progress={returningCustomersProgress}
        target={staff.targetReturningCustomers || 0}
      />
    </div>
  );
}

function AnalyticsCard({ title, value, icon: Icon, progress, target }: { title: string, value: string | number, icon: React.ComponentType<{ className?: string }>, progress: number, target: string | number }) {
  // Determine if the staff has met or exceeded the target
  const isMeetingTarget = progress >= 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${isMeetingTarget ? 'text-green-600' : 'text-red-600'}`}>{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${isMeetingTarget ? 'text-green-600' : 'text-red-600'}`}>{value}</div>
        <Progress value={progress} className={`mt-2 ${isMeetingTarget ? 'bg-green-600' : 'bg-secondary'}`} />
        <div className="text-xs text-muted-foreground mt-1">
          Target: {target}
        </div>
      </CardContent>
    </Card>
  );
}

function StaffInfo({ staff }: { staff: Staff }) {
  return (
    <div>
      <CardTitle className="text-2xl font-bold">{staff.name}</CardTitle>
      <p className="text-muted-foreground">{staff.email}</p>
      <div className="flex items-center">
        <TbLego className="mr-2 h-4 w-4" />
        <span>{staff.staffType}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <StaffBadge
          condition={!staff.isArchived}
          icon={Archive}
          trueText="Active"
          falseText="Archived"
        />
      </div>
    </div>
  );
}

function StaffBadge({ condition, icon: Icon, trueText, falseText }: { condition: boolean, icon: React.ComponentType<{ className?: string }>, trueText: string, falseText: string }) {
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

// function StaffDetails({ staff, currencySymbol }: { staff: any, currencySymbol: string }) {
//   const details = [
//     { icon: TbClipboardData, label: "Total Sales", value: `${currencySymbol}${staff.totalSales || 0}` },
//     { icon: ShoppingCart, label: "Total Transactions", value: staff.totalTransactionCount || 0 },
//     { icon: Archive, label: "Total Items Sold", value: staff.totalItemsSold || 0 },
//     { icon: Repeat, label: "Returning Customers", value: staff.returningCustomers || 0 },
//     { icon: Target, label: "Sales Target", value: `${currencySymbol}${staff.targetTotalSales || 0}` },
//   ];

//   return (
//     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//       {details.map((detail, index) => (
//         <div key={index} className="flex flex-col items-center bg-gray-50 p-4 rounded-lg shadow-sm">
//           <div className="flex items-center space-x-2 mb-2">
//             <detail.icon className="h-5 w-5 text-gray-500" />
//             <span className="text-sm font-semibold text-gray-700">{detail.label}</span>
//           </div>
//           <div className="text-xl font-bold text-gray-900">{detail.value}</div>
//         </div>
//       ))}
//     </div>
//   );
// }
