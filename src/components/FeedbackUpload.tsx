"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chart from "./Chart";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export default function FeedbackUpload() {
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const headers = result.meta.fields || [];

        if (!headers.includes("Feedback")) {
          setError("CSV must include a 'Feedback' column.");
          setCsvRows([]);
          setCsvHeaders([]);
          setFeedbacks([]);
          return;
        }

        const filtered = result.data
          .map((row: any) => row["Feedback"])
          .filter((f: string) => typeof f === "string" && f.trim().length > 0);

        if (filtered.length === 0) {
          setError("No valid feedback found in the 'Feedback' column.");
          setCsvRows([]);
          setCsvHeaders([]);
          setFeedbacks([]);
          return;
        }

        setFeedbacks(filtered);
        setCsvRows(result.data);
        setCsvHeaders(headers);
        setError(null);
      },
      error: (err) => {
        setError("Failed to parse CSV: " + err.message);
      },
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch("/api/generate-ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbacks }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data.result);
        setShowResult(true);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyseMore = () => {
    setShowResult(false);
    setResponse(null);
    setError(null);
    setCsvRows([]);
    setCsvHeaders([]);
    setFeedbacks([]);
  };

  const handleDownloadPdf = async () => {
    const element = document.querySelector(".download-content") as HTMLElement;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 5,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let position = 0;
    if (imgHeight < pageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    } else {
      let remainingHeight = imgHeight;
      while (remainingHeight > 0) {
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
        if (remainingHeight > 0) {
          pdf.addPage();
          position = -pageHeight;
        }
      }
    }

    pdf.save("feedback_analysis.pdf");
  };

  const parseChartDataFromResponse = (text: string) => {
    const sentimentMatches = [
      ...text.matchAll(/"(Positive|Neutral|Negative)"\s*:\s*(\d+)/g),
    ];
    const sentimentChartData: Record<string, number> = {};
    sentimentMatches.forEach(([_, label, value]) => {
      sentimentChartData[label] = parseInt(value, 10);
    });

    const topicMatches = [...text.matchAll(/"([^"]+)"\s*:\s*(\d+)/g)];
    const topicChartData: Record<string, number> = {};
    let passedSentiment = false;

    for (const [_, label, value] of topicMatches) {
      if (label === "Negative") {
        passedSentiment = true;
        continue;
      }
      if (
        passedSentiment &&
        !["Positive", "Neutral", "Negative"].includes(label)
      ) {
        topicChartData[label] = parseInt(value, 10);
      }
    }

    const extractArray = (label: string) => {
      const match = text.match(
        new RegExp(`"${label}"\\s*:\\s*\\[(.*?)\\]`, "s")
      );
      if (!match) return [];
      return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    };

    return {
      "Top Positive Comments": extractArray("Top Positive Comments"),
      "Main Complaints or Issues": extractArray("Main Complaints or Issues"),
      "Suggestions for Improvement": extractArray("Suggestions for Improvement"),
      "Overall Sentiment":
        text.match(/"Overall Sentiment"\s*:\s*"([^"]+)"/)?.[1] || "Neutral",
      "Sentiment Distribution Chart Data": sentimentChartData,
      "Topic Frequency Chart Data": topicChartData,
    };
  };

  if (showResult && response) {
    const chartData = parseChartDataFromResponse(response);

    return (
      <div className="download-content">
        <Card className="max-w-5xl mx-auto mt-8 p-10">
          <Chart data={chartData} />
          <div className="flex justify-evenly">
            <Button className="mt-4 self-end" onClick={handleAnalyseMore}>
              Analyse More Feedbacks
            </Button>
            <Button className="mt-4 self-end" onClick={handleDownloadPdf}>
              Download Full Page as PDF
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="max-w-5xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Upload Feedback CSV</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Input type="file" accept=".csv" onChange={handleFile} />
          {csvRows.length > 0 && (
            <div className="mt-4">
              <div className="font-semibold mb-2">Loaded CSV Data:</div>
              <div className="overflow-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr>
                      {csvHeaders.map((header) => (
                        <th
                          key={header}
                          className="border px-2 py-1 bg-muted font-medium text-left"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.map((row, i) => (
                      <tr key={i}>
                        {csvHeaders.map((header) => (
                          <td key={header} className="border px-2 py-1">
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={csvRows.length === 0 || loading}
            className="mt-2 self-end"
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
          {error && (
            <div className="mt-4 p-3 rounded bg-red-100 text-red-800 text-sm">
              Error: {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
