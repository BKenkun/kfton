
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"

interface ChartData {
  label: string;
  sales: number;
}

export default function SalesChart({ data }: { data: ChartData[] }) {
  const totalSales = useMemo(() => data.reduce((acc, item) => acc + item.sales, 0), [data]);

  return (
    <div className="flex flex-col h-full">
        <CardHeader className="pb-0">
            <CardTitle className="text-4xl">{totalSales}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
             <ChartContainer
                config={{
                sales: {
                    label: "Ventas",
                    color: "hsl(var(--chart-2))",
                },
                }}
                className="mx-auto aspect-square h-full"
            >
                <BarChart accessibilityLayer data={data}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                     <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                </BarChart>
            </ChartContainer>
        </CardContent>
    </div>
  )
}
