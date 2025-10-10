import { DeliveryOrderForm } from '@/components/DeliveryOrderForm';
import { useParams } from 'react-router-dom';

export default function EditDeliveryOrder() {
  const { id } = useParams<{ id: string }>();
  return <DeliveryOrderForm orderId={id ? parseInt(id) : undefined} title={`Edit Delivery Order - DO${id}`} />;
}
