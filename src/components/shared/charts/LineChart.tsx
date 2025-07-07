"use client"

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface LineChartProps {
  data: Array<Record<string, any>>
  xKey: string
  yKey: string
  title?: string
  color?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  strokeWidth?: number
}

export function LineChart({
  data,
  xKey,
  yKey,
  title,
  color = "#3b82f6",
  height = 300,
  showGrid = true,
  showLegend = false,
  strokeWidth = 2,
}: LineChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          {showLegend && <Legend />}
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={strokeWidth} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
