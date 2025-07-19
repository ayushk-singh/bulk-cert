"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF4444"];

type InsightsProps = {
  data: {
    "Top Positive Comments": string[];
    "Main Complaints or Issues": string[];
    "Suggestions for Improvement": string[];
    "Overall Sentiment": string;
    "Sentiment Distribution Chart Data": Record<string, number>;
    "Topic Frequency Chart Data": Record<string, number>;
  };
};

export default function Chart({ data }: InsightsProps) {
  const sentimentChartData = Object.entries(
    data["Sentiment Distribution Chart Data"]
  ).map(([name, value]) => ({ name, value }));

  const topicFrequencyData = Object.entries(
    data["Topic Frequency Chart Data"]
  ).map(([topic, count]) => ({ topic, count }));

  return (
    <div className="max-w-5xl mx-auto mt-8 flex flex-col gap-8">
      {/* Overall Sentiment Summary */}
      <Card className="shadow-lg bg-muted/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg md:text-xl">
            Overall Sentiment
          </CardTitle>
          <span
            className={`px-4 py-2 rounded text-base font-semibold ${
              data["Overall Sentiment"] === "Positive"
                ? "bg-green-100 text-green-700"
                : data["Overall Sentiment"] === "Negative"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {data["Overall Sentiment"]}
          </span>
        </CardHeader>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sentimentChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  dataKey="value"
                >
                  {sentimentChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Pie Chart Legend */}
            <div className="flex justify-center gap-6 mt-4">
              {sentimentChartData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="inline-block w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="shadow-lg bg-muted/40">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Top Positive Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-6 space-y-2 text-base">
              {data["Top Positive Comments"].map((item, index) => (
                <li key={index} className="mb-1 text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-muted/40">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Main Complaints or Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-6 space-y-2 text-base">
              {data["Main Complaints or Issues"].map((item, index) => (
                <li key={index} className="mb-1 text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-muted/40">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Suggestions for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-6 space-y-2 text-base">
              {data["Suggestions for Improvement"].map((item, index) => (
                <li key={index} className="mb-1 text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
