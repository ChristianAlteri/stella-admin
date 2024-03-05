'use client'

import { useParams, useRouter } from "next/navigation";

interface OrderStatusProps {
    order: any;

}

const OrderStatus: React.FC<OrderStatusProps> = ({
    order,
}) => {
    const params = useParams();

    //TODO: Write this 
    const handleOrderClick = async (order: any) => {
        try {
            console.log("FInish the orderCLicked function");
            // await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}`, { hasBeenDispatched: true });
        } catch (error) {
            console.error(error);
        }
    }

    return ( 
        <div key={order.id} className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                    <div className="text-sm font-medium">{order.address}</div>
                    <div className="text-sm font-medium">{order.email}</div>
                    <div className="text-sm font-medium">{order.createdAt.toDateString()}</div>
                    <div className="text-sm font-medium">
                        {order.orderItems.map((item: any) => 
                            <div key={item.id}>
                                <a className="hover:underline" href={`/${params.storeId}/products/${item.product.id}`}>{item.product.name}</a>
                            </div>
                        )}
                    </div>
                    <div>
                        <input className="hover:cursor-pointer" type="checkbox" onClick={() => handleOrderClick(order.id)} />
                    </div>
                </div>
     );
}
 
export default OrderStatus;