
"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { StripeOrder } from "@/lib/stripe"
import { useMemo } from "react"

interface ChartData {
  label: string;
  revenue: number;
}

export default function RevenueChart({ data }: { data: ChartData[] }) {
  return (
    <ChartContainer config={{
      revenue: {
        label: "Ingresos",
        color: "hsl(var(--chart-1))",
      },
    }}>
      <BarChart
        accessibilityLayer
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 10,
          bottom: 0,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent
              formatter={(value) => `${(value as number).toFixed(2)} €`}
              indicator="dot" 
            />}
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
