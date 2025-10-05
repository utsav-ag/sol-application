import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, TrendingUp, Package, Truck } from 'lucide-react';

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <BarChart className="h-8 w-8 text-primary" />
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">245</p>
              <p className="text-muted-foreground text-large mt-2">In inventory</p>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Package className="h-8 w-8 text-success" />
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-warning">12</p>
              <p className="text-muted-foreground text-large mt-2">Need restocking</p>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Truck className="h-8 w-8 text-primary" />
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">8</p>
              <p className="text-muted-foreground text-large mt-2">Awaiting delivery</p>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <TrendingUp className="h-8 w-8 text-success" />
                Orders Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-success">23</p>
              <p className="text-muted-foreground text-large mt-2">Completed</p>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Package className="h-8 w-8 text-primary" />
                Avg Items/Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">156</p>
              <p className="text-muted-foreground text-large mt-2">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Truck className="h-8 w-8 text-success" />
                Avg Orders/Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">18</p>
              <p className="text-muted-foreground text-large mt-2">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-large">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">Total Inventory Value</span>
                <span className="text-2xl font-bold">₹12,45,890</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">Items Sold This Month</span>
                <span className="text-2xl font-bold">3,456</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">Revenue This Month</span>
                <span className="text-2xl font-bold">₹8,76,540</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
