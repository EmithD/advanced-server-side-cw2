'use client'

import React, { useState, useEffect } from 'react'
import { IsAuth } from '../auth/IsAuth'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip as ToolTipShadCN,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Loader2 } from 'lucide-react'

const DashboardPage = () => {
  const [usageData, setUsageData] = useState([]);
  const [endpoints, setEndpoints] = useState<{ endpoint: string; requests: number; apiKey: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDashboard = async () => {
      setIsLoading(true);
      try {
        await IsAuth(localStorage.getItem('authToken') || '');

        const byDateResponse = await fetch('http://localhost:8080/api/usage/date', {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        const byEndpointResponse = await fetch('http://localhost:8080/api/usage/endpoint', {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (!byDateResponse.ok || !byEndpointResponse.ok) {
          throw new Error('Failed to fetch usage data');
        }

        const dateData = await byDateResponse.json();
        const endpointData = await byEndpointResponse.json();
        
        if (dateData.success && dateData.data) {
          setUsageData(dateData.data);
        } else {
          setUsageData([]);
        }
        
        if (endpointData.success && endpointData.data) {
          setEndpoints(endpointData.data);
        } else {
          setEndpoints([]);
        }
        
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setError(error instanceof Error ? error.message : String(error));

      } finally {
        setIsLoading(false);
      }
    };

    initDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">API Usage Dashboard</h1>
      
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800">
          <p className="font-medium">Error loading dashboard data:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>API Requests Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {usageData && usageData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={usageData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} requests`, 'Usage']}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString();
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="requests" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="Total Requests"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  No usage data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Requests by Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            {endpoints && endpoints.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints.map((item, index) => (
                    <TooltipProvider key={index}>
                      <ToolTipShadCN>
                        <TooltipTrigger asChild>

                          <TableRow>
                            <TableCell className="font-medium">{item.endpoint}</TableCell>
                            <TableCell className="text-right">{item.requests.toLocaleString()}</TableCell>
                          </TableRow>
                          
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.apiKey}</p>
                        </TooltipContent>
                      </ToolTipShadCN>
                    </TooltipProvider>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No endpoint data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage